import type { FormItemContext, FormItemRule } from "element-plus";
import type { MultiWatchSources, Ref, WatchOptions, WatchSource } from "vue";

import { ElForm } from "element-plus";
import { ref, watch } from "vue";

export interface ElFormRequiredRuleOptions {
    /** Message template. Use '%s' as field name, it will be replaced. */
    template: string;

    /** Validator trigger. */
    trigger?: string;

    /** Additional watch source, for re-creating rules. */
    watchSource?: WatchSource<unknown> | MultiWatchSources;
}

/**
 * Scan ElForm items, and create required rules for every ElFormItem.
 * The item must set `required` prop to `true`.
 *
 * @param form
 * @param options
 * @returns
 */
export function createRequiredRules(form: typeof ElForm, options: ElFormRequiredRuleOptions): Record<string, FormItemRule[]> {
    if (!form || !options || !options.template)
        throw new Error(`"form" and "options.template" are required.`);

    const rules: Record<string, FormItemRule[]> = {};

    (form.fields as FormItemContext[]).forEach((field) => {
        if (field.prop && typeof field.prop === "string" && field.required) {
            rules[field.prop] = [{
                required: true,
                message: options.template.replace("%s", field.label ?? field.prop),
                trigger: options.trigger,
            }];
        }
    });
    return rules;
}

/**
 * Create rules Ref<> for ElForm.
 * Recommendation: turn off `validate-on-rule-change` for ElForm.
 *
 * @param formRef The form which needs to create rules.
 * @param ruleOptions Rules options.
 * @param watchOptions Watch options, for re-creating rules.
 * @returns Ref<{}> which contains rules. You can bind it to ElForm.
 */
export function useRequiredRules(formRef: Ref<typeof ElForm>, ruleOptions: ElFormRequiredRuleOptions, watchOptions?: WatchOptions): Ref<Record<string, FormItemRule[]>> {
    const rulesRef = ref<Record<string, FormItemRule[]>>({});
    const watchSources: MultiWatchSources =
        Array.isArray(ruleOptions.watchSource) ? [formRef, ...ruleOptions.watchSource]
            : ruleOptions.watchSource == null ? [formRef]
                : [formRef, ruleOptions?.watchSource];

    watch(watchSources, curr => {
        const form = curr[0] as typeof ElForm;
        if (!form) return;
        rulesRef.value = createRequiredRules(form, ruleOptions);
    }, watchOptions);

    return rulesRef;
}
