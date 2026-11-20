import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/*
    Flat ESLint config (ESLint 9+ / 10). It lints the browser
    sources of the Vite app and ignores the build output.
*/
export default [
    {
        ignores: ['dist', 'node_modules']
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true }
            }
        }
    },
    js.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    {
        files: [
            'src/Services/**/*.{js,jsx}',
            'src/Context/**/*.{js,jsx}',
            'src/Hooks/**/*.{js,jsx}',
            'src/Utils/**/*.{js,jsx}'
        ],
        rules: {
            // These modules are not component files: the fast refresh
            // rule only makes sense for Components/ and Screens/.
            'react-refresh/only-export-components': 'off'
        }
    },
    {
        files: ['**/*.{js,jsx}'],
        rules: {
            // Components are often imported as `React` for the JSX runtime
            // even though the automatic runtime no longer needs it.
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
        }
    }
]
