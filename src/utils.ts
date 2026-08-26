/** 合并 CargoX 组件的可选 className，避免组件复制宿主应用的 class 工具。 */
export function cx(...classNameList: Array<string | false | null | undefined>): string {
  return classNameList.filter(Boolean).join(" ");
}
