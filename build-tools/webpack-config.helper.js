const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const AngularCompilerPlugin = require('@ngtools/webpack/src');
const LayoutResolver = require('./layout-resolver');

const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');

class WebpackConfigHelper {
  static applyLayoutConfig(config, basePath) {
    const index = config.plugins.findIndex((p) => {
      return p instanceof AngularCompilerPlugin.AngularCompilerPlugin;
    });
    const options = config.plugins[index]._options;
    options.directTemplateLoading = false;
    config.plugins.splice(index);

    const plugIn = new AngularCompilerPlugin.AngularCompilerPlugin(options);
    config.plugins.push(plugIn);

    config.module.rules.unshift({
      test: /\.html?$/,
      use: [
        'raw-loader',
        {
          loader: '@narik/webpack-tools',
          options: {
            resolver: new LayoutResolver(),
            basePath: config.plugins[index]._basePath + (basePath || ''),
          },
        },
      ],
    });
  }

  static applyFederationConfig(config, options) {
    config.output.uniqueName = options.uniqueName;
    config.optimization.runtimeChunk = false;

    const dashboardLibPath = path
      .join(__dirname, './../dist/dashboard-lib')
      .replace(/\\/g, '/');

    debugger;
    options.shared = options.shared || {
      '@angular/core': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.2',
      },
      '@angular/animations': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.2',
      },
      '@angular/forms': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.2',
      },
      '@angular/common': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.2',
      },
      '@angular/cdk': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.1',
      },
      '@angular/material': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '11.0.1',
      },
      '@narik/infrastructure': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '5.1.0',
      },
      '@narik/core': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '5.1.0',
      },
      '@narik/ui-core': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '5.1.0',
      },
      '@narik/ui-material': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '5.1.0',
      },
      '@ngx-translate/core': {
        singleton: true,
        strictVersion: false,
        requiredVersion: '13.0.0',
      },
      rxjs: {
        singleton: true,
        strictVersion: false,
        requiredVersion: '6.6.3',
      },
      'dashboard-lib': {
        import: dashboardLibPath,
        singleton: true,
        strictVersion: false,
        requiredVersion: '0.0.1',
      },
    };

    debugger;
    if (options.isHost) {
      for (const key in options.shared) {
        options.shared[key].eager = true;
      }
    }
    config.plugins.push(
      new ModuleFederationPlugin(
        options.isHost
          ? {
              remotes: {},
              shared: options.shared,
            }
          : {
              name: options.uniqueName,
              filename: options.filename,
              exposes: options.exposes,
              shared: options.shared,
            }
      )
    );
  }
}
module.exports = WebpackConfigHelper;
