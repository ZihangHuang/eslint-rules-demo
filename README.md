# ESLint 使用指南

## 目录

- ESLint 简介与配置
- Prettier 简介与配置
- ESLint 与 Prettier 搭配
- ESLint 与 Prettier 在常用编辑器的配置
- AST in ESLint
- 自定义 ESLint 规则

---

## 1. ESLint 简介与配置

ESLint 是在 ECMAScript/JavaScript 代码中识别和报告模式匹配的工具，它的目标是保证代码的一致性和避免错误，具有以下特性：

- ESLint 使用 Espree 解析 JavaScript。Espree 是进行 JS/JSX 语法解析和句法分析的 JS 库。
- ESLint 使用 AST 去分析代码中的模式。
- ESLint 是完全插件化的。每一个规则都是一个插件并且你可以在运行时添加更多的规则。

### 安装

如果使用`babel`，还需要安装`babel-eslint`。如果使用`React`，安装`eslint-plugin-react`

```
npm i -D eslint babel-eslint eslint-plugin-react
```

### 配置文件

配置文件命名和优先级如下：

1、.eslintrc.js  
2、.eslintrc.yaml  
3、.eslintrc.yml  
4、.eslintrc.json  
5、.eslintrc  
6、package.json

可以使用`eslint --init`命令创建出配置文件。

### 项目级与目录级的配置

如果同时存在项目根目录 .eslintrc.js 和 src/.eslintrc.js，这两个配置文件会进行合并，但是 src/.eslintrc.js 具有更高的优先级。

我们只要在 src/.eslintrc.js 中配置 "root": true，那么 ESLint 就会认为 src 目录为根目录，不再向上查找配置。

一份基本的 React&ESLint 配置：

```javascript
module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'babel-eslint', // 解释器
  parserOptions: {
    jsx: true,
    sourceType: 'module', // or script
    ecmaVersion: 2019,
  },
  extends: 'eslint:recommended', // 继承的子规范
  plugins: ['react'], // 依赖插件
  rules: {},
  globals: {},
};
```

如果同时使用了 Typescript：

```
npm i -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

It is important that you use the same version number for @typescript-eslint/parser and @typescript-eslint/eslint-plugin.

```javascript
module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    jsx: true,
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  // 自动发现React的版本，从而进行规范react代码
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  extends: ['plugin:@typescript-eslint/recommended'],

  // 有些版本的plugin是写@typescript-eslint/eslint-plugin
  plugins: ['@typescript-eslint'],
  rules: {},
  globals: {},
};
```

Vue 与 ESLint：

```
npm i -D eslint eslint-plugin-vue
```

安装`eslint-plugin-vue`，然后配置：

```js
module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'], // 继承的子规范
  plugins: [],
  rules: {
    "vue/no-multiple-template-root": "off",
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
}

```

注意：`parser: 'babel-eslint'` 必须写在 `parserOptions` 里，因为 `eslint-plugin-vue` 使用 `vue-eslint-parser` 去解析 vue 文件，如果 `parser: 'babel-eslint'` 写在外面，会覆盖 `parser` 选项让其失效。
更详细可查阅插件文档[How to use a custom parser](https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser)。

### parser

ESLint 解析器，默认使用`Espree`作为其解析器，如果想指定其他解析器，该解析器需符合下列要求：

1、它必须是一个 Node 模块，可以从它出现的配置文件中加载。通常，这意味着应该使用 npm 单独安装解析器包。  
2、它必须符合 parser interface。  
3、基于[ESTree](https://github.com/estree/estree)

以下解析器与 ESLint 兼容：

- Babel-ESLint - 一个对 Babel 解析器的包装，使其能够与 ESLint 兼容。
- @typescript-eslint/parser - 将 TypeScript 转换成与 estree 兼容的形式，以便在 ESLint 中使用。

### extends

可以是一个字符串，也可以是一个数组。其中可以包含以下内容：

- 以 `eslint:` 开头的字符串，如 eslint:recommended，这样写意味着使用 ESLint 的推荐配置。
- 以 `plugin:` 开头的字符串，是扩展插件类型，也可以直接在 plugins 属性中进行设置。如 "plugin:react/recommended"，这些写意味着应用 eslint-plugin-react 的所有推荐规则。
- 已 `eslint-config-` 开头的包，这其实是第三方规则的集合，由于 eslint 中添加了额外的处理，我们也可以省略 eslint-config-，如 eslint-config-airbnb 也可以写作 airbnb。
- 一个本地路径，指向本地的 ESLint 配置，如 `./rules/react`。

你可以将自己的 lint 配置发布到 npm 包，只要将包名命名为 eslint-config-xxx 即可，同时，需要在 package.json 的 peerDependencies 字段中声明你依赖的 ESLint 的版本号。

### plugins

虽然官方提供了上百种的规则可供选择，但是这还不够，因为官方的规则只能检查标准的 JavaScript 语法，如果你写的是 JSX 或者 Vue 单文件组件，ESLint 的规则就开始束手无策了。

这个时候就需要安装 ESLint 的插件，来定制一些特定的规则进行检查。插件可以提供处理器，处理器可以从另一种文件中提取 JavaScript 代码，然后让 ESLint 检测 JavaScript 代码。或者处理器可以在预处理中转换 JavaScript 代码。ESLint 的插件与扩展一样有固定的命名格式，以 eslint-plugin- 开头，使用的时候也可以省略这个头。

两种用法：

- 在 plugin 中使用，如添加配置`plugins: ['react']`，可声明自己想要引用的 eslint-plugin-react 提供的规则，但是具体用哪些，怎么用，还是需要在 rules 中配置。
- 在 extends 中使用， plugin 具有自己的命名空间，可通过`extends": ["plugin:myPlugin/myConfig"]`引用 plugin 中的某类规则（可能是全部，也可能是推荐）。如 eslint-plugin-react 包，源码的定义：

```javascript
module.exports = {
  // 可用的扩展
  configs: {
    // plugin:react/recommended
    recomended: {
      plugins: [ 'react' ]
      rules: {...}
    },
    // plugin:react/all
    all: {
      plugins: [ 'react' ]
      rules: {...}
    }
  }
}
```

配置名是插件配置的 configs 属性定义的，这里的配置其实就是 ESLint 的扩展，通过这种方式即可以加载插件，又可以加载扩展。

### 规则设置

ESLint 附带有大量的规则，你可以在配置文件的 rules 属性中配置你想要的规则。每一条规则接受一个参数，大多数参数的值如下：

- "off" 或 0：关闭规则
- "warn" 或 1：开启规则，warn 级别的错误 (不会导致程序退出)
- "error" 或 2：开启规则，error 级别的错误(当被触发的时候，程序会退出)

还有一些参数的值是字符串或数组，如设置引号的规则：

```json
{
  "rules": {
    // 使用数组形式，对规则进行配置
    // 第一个参数为是否启用规则
    // 后面的参数才是规则的配置项
    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true // 允许字符串使用单引号或双引号，只要字符串中包含了一个其它引号，否则需要转义
      }
    ]
  }
}
```

根据上面的规则：

```javascript
// bad
var str = "test 'ESLint' rule";

// good
var str = 'test "ESLint" rule';
```

可以在你的文件中使用以下格式的块注释来临时禁止规则出现警告：

```js
/* eslint-disable */

alert('foo');

/* eslint-enable */
```

也可以对指定的规则启用或禁用警告:

```js
/* eslint-disable no-alert, no-console */

alert('foo');
console.log('bar');

/* eslint-enable no-alert, no-console */
```

也可以对应语句的前一行加上

```js
// eslint-disable-next-line react-hooks/exhaustive-deps
```

若要禁用一组文件的配置文件中的规则，请使用 overrides 和 files。例如:

```js
{
  "rules": {...},
  "overrides": [
    {
      "files": ["*-test.js","*.spec.js"],
      "rules": {
        "no-unused-expressions": "off"
      }
    }
  ]
}
```

## 2. Prettier 简介与配置

Prettier 是一个 Opinionated 的代码格式化工具，Opinionated 的意思是，不管你写的代码是个什么鬼样子，Prettier 会去掉你代码里的所有样式风格，然后用统一固定的格式重新输出。它的特点之一是除了必要的设置项，不会再给更多。给设置项越多，可能会越乱，越容易引发分歧。

### 安装

```
npm i -D prettier
```

Prettier 的配置很简单，新建`.prettierrc`文件，写入想要的规则：

```json
{
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

## 3. ESLint 与 Prettier 搭配

ESLint 等各种 Linters 一般按照两种规则去检查代码：

- Formatting rules：例如 ESlint 的 max-len 规则，设置单行长度不能超过 80 字符；例如 ESLint 的 keyword-spacing 规则，关键字前后必须有空格。
- Code-quality rules：例如 ESLint 的 no-unused-vars 规则，不允许没用的变量定义出现。

Prettier 对应的是各种 Linters 的 Formatting rules 这一类规则。当 ESLint 遇到 Formatting rules 的规则错误时，会提示让你修改，而 Prettier 则不管你符不符合什么规则，先把代码解析成 AST，然后格式化输出代码。

所以同时引入 ESLint 与 Prettier，可能会产生冲突，需要：

1、禁用 Linters 自己的 Formatting rules，让 Prettier 接管这些职责。这些配置有现成的 Config，Linters 的配置继承这个 Config 就可以了。  
2、让 Linters 执行时首先能够调用 Prettier 格式化，然后再检查 Code-quality 类规则。这是 由 Linters 的 Plugin 实现的。

安装以下包：

- eslint-config-prettier：解决 ESLint 中的样式规范和 Prettier 中样式规范的冲突，以 Prettier 的样式规范为准，使 ESLint 中的样式规范自动失效。
- eslint-plugin-prettier：调用 Prettier 格式化代码，然后与格式化前对比，如果不一致，这个地方就会被 Prettier 进行标记。

同时 ESLint 配置文件：

```javascript
module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    jsx: true,
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  extends: ['prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {},
  globals: {},
};
```

上面修改的 extends 的配置中：

- prettier/@typescript-eslint：使得@typescript-eslint 中的样式规范失效，遵循 Prettier 中的样式规范。
- plugin:prettier/recommended：使用 Prettier 中的样式规范，且使得 ESLint 会检测 Prettier 的格式问题，同样将格式问题以 error 的形式抛出。

`extends: ['plugin:prettier/recommended']`其实是以下的简化：

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error" // 表示被 prettier 标记的地方抛出错误
  }
}
```

## 4. ESLint 与 Prettier 在常用编辑器的配置

### 4-1. vscode

安装 ESLint 和 Prettier 拓展。

打开 setting.json 根据需要设置：

- ESLint

```json
{
  "eslint.enable": true, // 是否开启vscode的eslint
  "eslint.autoFixOnSave": false, // 是否在保存的时候自动fix eslint
  "eslint.options": {
    // 指定vscode的eslint所处理的文件的后缀
    "extensions": [".js", ".vue", ".ts", ".tsx"],
    // 配置文件的绝对路径
    "configFile": ""
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "html",
      "autoFix": true
    },
    {
      "language": "vue",
      "autoFix": true
    },
    {
      "language": "typescript",
      "autoFix": true
    },
    {
      "language": "typescriptreact",
      "autoFix": true
    }
  ]
}
```

- Prettier

```json
{
  // 代码在保存的时候自动格式化
  "editor.formatOnSave": true,
  // 设置各种文件采用 prettier-vscode 拓展进行格式化
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

- vue 文件的格式化。

建议使用 Vetur 插件。Vetur 是 Vue 的一个 vscode 拓展，内置了 prettier、prettier-eslint、prettyhtml、eslint-plugin-vue 等。

指定 \*.vue 文件的格式化工具为 vetur

```json
{
  "[vue]": {
    "editor.defaultFormatter": "octref.vetur"
  }
}
```

其默认设置如下：

```json
{
  "vetur.format.defaultFormatter.html": "prettyhtml",
  "vetur.format.defaultFormatter.css": "prettier",
  "vetur.format.defaultFormatter.postcss": "prettier",
  "vetur.format.defaultFormatter.scss": "prettier",
  "vetur.format.defaultFormatter.less": "prettier",
  "vetur.format.defaultFormatter.stylus": "stylus-supremacy",
  "vetur.format.defaultFormatter.js": "prettier",
  "vetur.format.defaultFormatter.ts": "prettier",
  "vetur.format.defaultFormatter.sass": "sass-formatter"
}
```

可以把 html 的格式化工具更改为：

```json
{
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  // 格式化插件的配置
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "auto", // 属性强制折行对齐
      "wrap_line_length": 0, // 设置一行多少字符换行，设置为 0 表示不换行
      "semi": false, //
      "singleQuote": true // 单引号
    }
  }
}
```

### 4-2. Sublime_Text

安装以下插件：

- Sublime​Linter：是一个代码检查框架插件，功能非常强大，支持各种语言的检查。但是它本身并没有代码检查的功能，需要借助 ESLint 这样的特定语言检查支持。
- Sublime​Linter-eslint：Sublime​Linter 的一个插件，提供接口给 ESLint。
- Js​Prettier：Prettier 的 sublime_text 插件。

Js​Prettier 需要配置 node 的路径：

```json
{
  "node_path": "/Users/xxx/.nvm/versions/node/v8.11.2/bin/node",
  "prettier_cli_path": "/usr/local/bin/prettier" // 如果 Prettier 全局安装需要配置
}
```

## AST in ESLint

要实现静态分析则需要自建一个预编译阶段对代码进行解析。

首先我们看看大部分编译器工作时的三个阶段：

解析：将未经处理的代码解析成更为抽象的表达式，通常为抽象语法树，即 AST。
转换：通过修改解析后的代码表达式，将其转换为符合预期的新格式。
代码生成：将转换后的表达式生成为新的目标代码。

对于 ESLint 来说，规则校验发生在将 JavaScript 代码解析为 AST 之后，遍历 AST 的过程中。

ESLint 使用了一个叫做 Espree 的 JavaScript 解析器来把 JavaScript 代码解析为一个 AST，然后深度遍历 AST，每条规则都会对匹配的过程进行监听，每当匹配到一个类型，相应的规则就会进行检查。为了方便查看 AST 的各个节点类型，有一个网站能十分清晰的查看一段代码解析成 AST 之后的样子：[astexplorer](https://astexplorer.net/)。

例如，`const a = 2` 编译成 AST 的样子：

```json
{
  "type": "VariableDeclaration",
  "start": 0,
  "end": 11,
  "range": [0, 11],
  "declarations": [
    {
      "type": "VariableDeclarator",
      "start": 6,
      "end": 11,
      "range": [6, 11],
      "id": {
        "type": "Identifier",
        "start": 6,
        "end": 7,
        "range": [6, 7],
        "name": "a"
      },
      "init": {
        "type": "Literal",
        "start": 10,
        "end": 11,
        "range": [10, 11],
        "value": 2,
        "raw": "2"
      }
    }
  ],
  "kind": "const"
}
```

源代码在 AST 中，会被拆解成不同类型的 node，每个 node 有自己的 type，各种 type 有其特定的属性参数，具体可以查阅[MDN](https://developer.mozilla.org/zh-CN/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Node_objects)。

以上文为例，`const`在 AST 中就是一个 Type 为`VariableDeclaration`的 node，这个 node 包含两种属性：

- `declarations`：指声明变量，之所以是数组形式，是为了应付这种写法`const a = 2, b = 3`
- `kind`：指`VariableDeclaration`有三种类型：`const`、`let`、`var`。

`VariableDeclarator`这种 type 的 node 就是像`a = 2`的声明，其包含两种属性：

- id：一个 type 为`Identifier`的 node，该 node 主要有`name`属性，在上文的栗子就是`a`。
- init：指初始值，一个 type 为`Literal`的 node，该 node 主要有`value`属性，在上文的栗子就是`2`。

另外，每个 node 都有`start`、`end`、`range`属性，代表该 node 在代码的位置。

下面是 `console.log(1)` 编译成 AST 的样子：

```json
{
  "type": "ExpressionStatement",
  "start": 0,
  "end": 14,
  "expression": {
    "type": "CallExpression",
    "start": 0,
    "end": 14,
    "callee": {
      "type": "MemberExpression",
      "start": 0,
      "end": 11,
      "object": {
        "type": "Identifier",
        "start": 0,
        "end": 7,
        "name": "console"
      },
      "property": {
        "type": "Identifier",
        "start": 8,
        "end": 11,
        "name": "log"
      },
      "computed": false,
      "optional": false
    },
    "arguments": [
      {
        "type": "Literal",
        "start": 12,
        "end": 13,
        "value": 1,
        "raw": "1"
      }
    ],
    "optional": false
  }
}
```

可以看到 `console.log()` 属于 `ExpressionStatement(表达式语句)` 中的 `CallExpression(调用语句)`。

ESLint 提供了类似 CSS 选择器的 `AST selectors`，方便我们匹配到 AST 中的特定内容。  
例如以下代码生成的 AST：

```javascript
var foo = 1;
bar.baz();
```

```json
{
  "type": "Program",
  "start": 0,
  "end": 23,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 12,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 11,
          "id": {
            "type": "Identifier",
            "start": 4,
            "end": 7,
            "name": "foo"
          },
          "init": {
            "type": "Literal",
            "start": 10,
            "end": 11,
            "value": 1,
            "raw": "1"
          }
        }
      ],
      "kind": "var"
    },
    {
      "type": "ExpressionStatement",
      "start": 13,
      "end": 23,
      "expression": {
        "type": "CallExpression",
        "start": 13,
        "end": 22,
        "callee": {
          "type": "MemberExpression",
          "start": 13,
          "end": 20,
          "object": {
            "type": "Identifier",
            "start": 13,
            "end": 16,
            "name": "bar"
          },
          "property": {
            "type": "Identifier",
            "start": 17,
            "end": 20,
            "name": "baz"
          },
          "computed": false,
          "optional": false
        },
        "arguments": [],
        "optional": false
      }
    }
  ],
  "sourceType": "module"
}
```

当我们使用选择器 `Identifier`，匹配到的是 type 为 Identifier 的文本节点，对应到源码里的就是 foo, bar, baz。

还可以像 CSS 选择器一样，使用 `VariableDeclarator > Identifier` 抓取到 `VariableDeclarator` 下的所有 `Identifier` 儿子节点。更详细的语法可以查阅[文档](https://cn.eslint.org/docs/developer-guide/selectors#what-syntax-can-selectors-have)

## 自定义 ESLint 规则

ESLint 官方为了方便开发者，提供了 Yeoman 的模板（generator-eslint），开发插件或自定义规则时可以用到。

```bash
npm install -g yo generator-eslint

# 创建插件模板
yo eslint:plugin

# 创建自定义规则模板
yo eslint:rule
```

执行 `yo eslint:plugin` 和 `yo eslint:rule` 会创建出以下文件：

- `lib/rules` 目录：自定义规则文件
- `lib/index.js` 插件入口文件
- `tests/lib` 目录：测试文件
- `docs` 目录：文档
- `package.json`等

规则源码的基本样式如下

```javascript
/**
 * @fileoverview Rule to disallow unnecessary semicolons
 * @author Nicholas C. Zakas
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow unnecessary semicolons',
      category: 'Possible Errors',
      recommended: true,
      url: 'https://eslint.org/docs/rules/no-extra-semi',
    },
    fixable: 'code',
    schema: [], // no options
  },
  create: function (context) {
    return {
      // callback functions
    };
  },
};
```

- `meta` 包含规则的元数据，具体查阅文档[自定义规则](https://cn.eslint.org/docs/developer-guide/working-with-rules#rule-basics)
- `create` 返回一个对象，其中包含了 ESLint 在遍历 JavaScript 代码的抽象语法树 AST ( ESTree 定义的 AST ) 时，用来访问节点的方法，它的键就是上面说的 `AST selectors`。

  在拿到 AST 之后，ESLint 会以"从上至下"再"从下至上"的顺序遍历每个选择器两次。我们所监听的选择器默认会在"从上至下"的过程中触发，如果需要在"从下至上"的过程中执行则需要添加:exit，在下文中 CallExpression 就变为 CallExpression:exit。一段代码解析后可能包含多次同一个选择器，选择器的钩子也会多次触发。

  如果不满足条件，可用 `context.report()` 抛出问题。ESLint 会利用我们的配置对抛出的内容做不同的展示。其参数`context`的定义详看(The Context Object)[https://cn.eslint.org/docs/developer-guide/working-with-rules#the-context-object]

  另外也可以用`context.getSourceCode()`获取源代码。

一个 禁止 `console.log` 的栗子：

```javascript
module.exports = {
  meta: {
    docs: {
      description: 'disable console',
      category: 'Possible Errors',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  },
  create: function (context) {
    const logs = [
      'debug',
      'error',
      'info',
      'log',
      'warn',
      'dir',
      'dirxml',
      'table',
      'trace',
      'group',
      'groupCollapsed',
      'groupEnd',
      'clear',
      'count',
      'countReset',
      'assert',
      'profile',
      'profileEnd',
      'time',
      'timeLog',
      'timeEnd',
      'timeStamp',
      'context',
      'memory',
    ];

    return {
      CallExpression(node) {
        const allowLogs = context.options[0];
        const disableLogs = Array.isArray(allowLogs)
          ? logs.filter((log) => !allowLogs.includes(log))
          : logs;

        const callObj = node.callee.object;
        const callProp = node.callee.property;

        if (!callObj || !callProp) return;

        if (callObj.name !== 'console') return;

        if (disableLogs.includes(callProp.name)) {
          context.report({
            // （可选）与问题有关的 AST 节点。如果存在且没有指定 loc，那么该节点的开始位置被用来作为问题的位置
            node,
            message: 'error: should remove console',
            // (可选的) 用来指定问题位置的一个对象。如果同时指定的了 loc 和 node，那么位置将从loc获取而非node。
            // loc: {
            //   start: 0,
            //   end: 100
            // }
          });
        }
      },
    };
  },
};
```

### 如何使用

自定义规则需要通过引入插件来使用，可以发布 npm 插件包，或者通过 `npm link` 等使用本地的插件模块。

```javascript
module.exports = {
  plugins: ['yourPlugin'],
  rules: {
    'yourPlugin/youRule': 2,
  },
};
```

### ESLint 遍历 AST 过程图解

```js
function add(a) {
	return a + 1
}
```

这段代码用AST标识大概是这样

- FunctionDeclaration
  - Identifier (id)
  - Identifier (params[0])
  - BlockStatement (body)
    - ReturnStatement (body)
      - BinaryExpression (argument)
        - Identifier (left)
        - Literal (right)

我们来看看它的遍历过程

- Enter FunctionDeclaration
  - Enter Identifier (id)
    - Hit dead end
  - Exit Identifier (id)
  - Enter Identifier (params[0])
    - Hit dead end
  - Exit Identifier (params[0])
  - Enter BlockStatement (body)
    - Enter ReturnStatement (body)
      - Enter BinaryExpression (argument)
        - Enter Identifier (left)
          - Hit dead end
        - Exit Identifier (left)
        - Enter Literal (right)
          - Hit dead end
        - Exit Literal (right)
      - Exit BinaryExpression (argument)
    - Exit ReturnStatement (body)
  - Exit BlockStatement (body)
- Exit FunctionDeclaration

### CodePath

我们的程序中免不了有各种条件语句，循环语句，这让我们程序中的代码不一定是顺序执行，也不一定只执行一次。code path 指的是程序的执行路径。程序可以由若干 code path 表达，一个 code path 可能包括两种类型的对象 CodePath 和 CodePathSegment。具体定义详看[code-path-analysis](https://cn.eslint.org/docs/developer-guide/code-path-analysis)

举个官网上的栗子：

```js
if (a && b) {
  foo();
}
bar();
```

分析一下上述代码的可能执行路径。

- 如果 a 为真 - 检测 b 是否为 真
  - 如果 b 为真 — 执行 foo() — 执行 bar()
  - 如果 b 非真 — 执行 bar()
- 如果 a 非真，执行 bar()

转换为 AST 的表达方式，如下图所示

![img](https://cn.eslint.org/docs/developer-guide/code-path-analysis/helo.svg)

在这里上述这个整体可以看作一个 CodePath，而 CodePathSegment 则是上述分支中的一部分，一个 code path 由多个 CodePathSegment 组成，ESLint 将 code path 抽象为 5 个事件。

- onCodePathStart：在一个`CodePath`的起点时触发，例如`Program`、`FunctionDeclaration`、`FunctionExpression`等。
- onCodePathEnd：在一个`CodePath`的终点时触发，能获取到完整的`CodePath`的对象。
- onCodePathSegmentStart：在一个`CodePathSegment`的起点时触发，意味着程序有了分岔或合并。
- onCodePathSegmentEnd：在一个`CodePath`的终点时触发。
- onCodePathSegmentLoop：通常在循环时触发。

在自定义规则时，有时候需要获取代码的运行情况，例如判断代码是否已`return`，可以这样：

```js
// 判断CodePathSegment是否已中断，为false时代表已 return, throw, break 等
function isReachable(segment) {
  return segment.reachable;
}

module.exports = {
  meta: {
    // ...
  },
  create(context) {
    let currentCodePath = null;

    return {
      // 在onCodePathStart获取到codePath
      onCodePathStart(codePath) {
        currentCodePath = codePath;
      },
      onCodePathEnd() {
        // 获取上层函数或作用域的codePath
        currentCodePath = currentCodePath.upper;
      },

      'SwitchCase:exit'(node) {
        // 在监听事件里可以使用codePath获取一些信息，如 reachable 等
        if (currentCodePath.currentSegments.some(isReachable)) {
          // do someThing
        }
      },
    };
  },
};
```

## 常用问题

### ts项目声明枚举enum eslint会报错assigned a value but never used
```json
{ 
  // 注意你必须禁用基本规则，因为它可以报告不正确的错误
  "no-unused-vars" : "off" , 
  "@typescript-eslint/no-unused-vars" : [ "error" ] 
}
```