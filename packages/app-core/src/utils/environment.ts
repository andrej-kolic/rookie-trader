export type EnvironmentVariables = {
  // set by bundler
  readonly BUILD_ENVIRONMENT: string;
  readonly BUNDLER: string;
  readonly MODE: string;

  // client
  readonly APP_REACT_ENV_FILE: string;
  readonly APP_REACT_ENV_FILE_ROOT: string;
  readonly APP_REACT_ENV_FILE_STAGING: string;
  readonly APP_REACT_ENV_FILE_STAGING_LOCAL: string;

  readonly APP_REACT_TITLE: string;
  readonly APP_REACT_KRAKEN_PROXY_URL: string;
};

const environmentVariables: EnvironmentVariables = {
  BUILD_ENVIRONMENT: import.meta.env.BUILD_ENVIRONMENT,
  BUNDLER: import.meta.env.BUNDLER,
  MODE: import.meta.env.MODE,

  APP_REACT_ENV_FILE: import.meta.env.APP_REACT_ENV_FILE,
  APP_REACT_ENV_FILE_ROOT: import.meta.env.APP_REACT_ENV_FILE_ROOT,
  APP_REACT_ENV_FILE_STAGING: import.meta.env.APP_REACT_ENV_FILE_STAGING,
  APP_REACT_ENV_FILE_STAGING_LOCAL: import.meta.env
    .APP_REACT_ENV_FILE_STAGING_LOCAL,

  APP_REACT_TITLE: import.meta.env.APP_REACT_TITLE,
  APP_REACT_KRAKEN_PROXY_URL: import.meta.env.APP_REACT_KRAKEN_PROXY_URL,
};

// TODO: rename to getRuntimeEnvVariables()
export function getEnvironmentVariables() {
  return environmentVariables;
}
