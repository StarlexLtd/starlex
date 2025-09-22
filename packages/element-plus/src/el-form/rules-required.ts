import type { FormItemContext, FormItemRule } from "element-plus";

import { ElForm } from "element-plus";

interface ElFormRequiredRuleOptions {
    /** Message template. Use '%s' as field name, it will be replaced. */
    template: string;

    /** Validator trigger. */
    trigger?: string;
}

export function createRequiredRules(form: typeof ElForm, options: ElFormRequiredRuleOptions): Record<string, FormItemRule[]> | undefined {
    if (!form) return undefined;

    const rules: Record<string, FormItemRule[]> = {};;

    (form.fields as FormItemContext[]).forEach((field) => {
        if (field.prop && typeof field.prop === "string" && field.required) {
            rules[field.prop] = [{
                required: true,
                message: options.template.replace("%s", field.label ?? field.prop),
                trigger: options.trigger,
            }];
        }
    })
    return rules;
}
