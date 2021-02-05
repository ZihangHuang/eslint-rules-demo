# eslint-plugin-my-practice

eslint plugin practice demo

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-my-practice`:

```
$ npm install eslint-plugin-my-practice --save-dev
```


## Usage

Add `my-practice` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "my-practice"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "my-practice/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





