const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add platform-specific module resolution
config.resolver = {
    ...config.resolver,
    resolverMainFields: ['browser', 'main', 'module'],
    platforms: ['ios', 'android', 'web'],
    sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
    assetExts: config.resolver.assetExts,
    // Exclude native-only modules from web builds
    blockList: config.resolver.blockList,
    extraNodeModules: {
        ...config.resolver.extraNodeModules,
    },
    resolveRequest: (context, moduleName, platform) => {
        // Exclude react-native-maps and other native modules from web
        if (platform === 'web') {
            const nativeOnlyModules = [
                'react-native-maps',
                '@react-native-community/geolocation',
                'react-native-razorpay',
            ];

            if (nativeOnlyModules.some(mod => moduleName.includes(mod))) {
                // Return a mock empty module for web
                return {
                    type: 'empty',
                };
            }
        }

        // Use default resolution
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = withNativeWind(config, { input: './global.css' });