import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { execa }  from "execa";
import semver from "semver";
import chalk from "chalk";
import enquirer from "enquirer";
import minimist from "minimist";
import { log } from "../packages/core/src/utils/logger";

interface IArgs {
    dry?: boolean;
    d?: boolean;

    skipTests?: boolean;
    s?: boolean;

    skipBuild?: boolean;
    b?: boolean;

    tag?: string;
    t?: string;
}

const { prompt } = enquirer;
const packageName = process.argv.at(-1);
if (!packageName) {
    log.error("Package name not specified.");
    log.info("Usage: release.ts [Options] <PackageName>");
    process.exit(0);
}

const targetPath = path.resolve(process.cwd(), "packages/", packageName);
if (!fs.existsSync(targetPath)) {
    log.error("Path not exists:", targetPath);
    log.info("Usage: release.ts [Options] <PackageName>");
    process.exit(0);
}
process.chdir(targetPath);

const args = minimist<IArgs>(process.argv.slice(2, -1));

const MAIN_PACKAGE_FILE = "./package.json";

const isDryRun = args.dry || args.d;
const skipTests = args.skipTests || args.s;
const skipBuild = args.skipBuild || args.b;
let releaseTag = args.tag || args.t;

const run = (bin: string, args: any[], opts = {}) => execa(bin, args, { stdio: "inherit", ...opts });
const dryRun = (bin: string, args: any[], opts = {}) => {
    console.log(chalk.blue(`[dryrun] ${bin} ${args.join(" ")}`), opts);
};
const runIfNotDry = isDryRun ? dryRun : run;
const logStep = (msg: string) => {
    console.log();
    log.info(msg);
};
const logSkipped = (msg = "Skipped") => {
    log.warn(`(${msg})`);
};

main();

async function main() {
    const pkgFile = fs.readFileSync(MAIN_PACKAGE_FILE, { encoding: "utf8" });
    const pkg = JSON.parse(pkgFile);
    const currentVersion = pkg.version as string;

    const preId =
        args.preid ||
        args.p ||
        (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)![0]);
    const preIdTag = preId ? "a" : "";  // a - alpha

    const versionIncrements: semver.ReleaseType[] = [
        "prerelease",
        "patch",
        "minor",
        "major",
    ];

    const inc = (i: semver.ReleaseType) => semver.inc(currentVersion, i, preIdTag);

    const { release } = await prompt<{release: string}>({
        type: "select",
        name: "release",
        message: "Select release type:",
        choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(["custom"])
    });

    let version;
    if (release === "custom") {
        const r = await prompt < { version: string }>({
            type: "input",
            name: "version",
            message: "Input custom version:"
        });
        version = r.version;
    } else {
        version = release!.match(/\((.*)\)/)![1];
    }

    if (!semver.valid(version)) {
        throw new Error(`Invalid target version: ${version}`);
    }

    const { confirm } = await prompt<{ confirm: boolean }>({
        type: "confirm",
        name: "confirm",
        message: `Confirm release ${version}?`
    });

    if (!confirm) return;

    // 执行单元测试
    // logStep("Running test...")

    // if (!skipTests && !isDryRun) {
    //   await run(bin("jest"), ["--clearCache"])
    //   await run(bin("jest"), [
    //     "--bail",
    //     "--runInBand",
    //     "--passWithNoTests"
    //   ])
    // } else {
    //   logSkipped()
    // }

    logStep("Updating version...");

    pkg.version = version;
    fs.writeFileSync(MAIN_PACKAGE_FILE, JSON.stringify(pkg, null, 4) + "\n");

    // 构建库
    logStep(`Building package...`);

    if (!skipBuild) {
        await run("pnpm", ["release"]);
    } else {
        logSkipped();
    }

    /*
    // 更新 Change Log
    logStep("Updating changelog...");

    await run("pnpm", ["changelog"]);

    // 提交改动
    logStep("Comitting changes...");

    const { stdout } = await run("git", ["diff"], { stdio: "pipe" });

    if (stdout) {
      await runIfNotDry("git", ["add", "-A"]);
      await runIfNotDry("git", ["commit", "-m", `release: v${version}`]);
    } else {
      logSkipped("No changes to commit");
    }
    */

    // 发布
    logStep("Publishing package...");

    if (!releaseTag) {
        releaseTag = semver.prerelease(version) ? "prerelease" : "latest";
    }
    log.info(`Release with tag: ${releaseTag}`);

    try {
        await runIfNotDry(
            "pnpm",
            [
                "publish",
                // "--registry=https://registry.npmjs.org/",
                ...(releaseTag ? ["--tag", releaseTag] : [])
            ],
            { stdio: "pipe" }
        );

        log.success(`Successfully published version ${version}`);
    } catch (err) {
        if ((err as any).stderr.match(/previously published/)) {
            log.error(`Skipping already published version ${version}`);
        } else {
            throw err;
        }
    }

    if (isDryRun) {
        log.success("Dry run finished - run git diff to see package changes");
    } else {
        log.success(`Release successfully`);
    }

    console.log();
}
