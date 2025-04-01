"use client";

import dynamic from "next/dynamic";

// Dynamically import the Form components
export const DynamicForm = dynamic(
  () => import("./form").then((mod) => ({ default: mod.Form })),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  }
);

export const DynamicFormControl = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormControl }))
);
export const DynamicFormDescription = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormDescription }))
);
export const DynamicFormField = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormField }))
);
export const DynamicFormItem = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormItem }))
);
export const DynamicFormLabel = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormLabel }))
);
export const DynamicFormMessage = dynamic(() =>
  import("./form").then((mod) => ({ default: mod.FormMessage }))
);

// Re-export the useFormField hook directly since hooks cannot be dynamically imported
export { useFormField } from "./form";