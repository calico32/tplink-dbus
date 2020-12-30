declare module 'webpack-filter-warnings-plugin' {
  import { Compiler, WebpackPluginInstance } from 'webpack';

  export type AllowedFilter = ((filterPhrase: string) => boolean) | RegExp;

  export type ExcludeOption = string | AllowedFilter;

  export type WebpackLogWarning = string | { message: string };

  class FilterWarningsPlugin implements WebpackPluginInstance {
    constructor({ exclude }: { exclude: ExcludeOption | ExcludeOption[] });
    apply(compiler: Compiler): void;
  }

  export = FilterWarningsPlugin;
}
