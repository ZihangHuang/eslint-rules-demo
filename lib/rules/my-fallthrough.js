/**
 * @fileoverview my-fallthrough
 * @author qwerty
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const DEFAULT_FALLTHROUGH_COMMENT = /my-falls?\s?through/iu;

function getArrayLast(arr) {
    return arr[arr.length - 1]
}

// 判断node前面是否带有注释的标识
function hasFallthroughComment(node, context, fallthroughCommentPattern) {
    const sourceCode = context.getSourceCode()
    const comments = sourceCode.getCommentsBefore(node)
    const comment = getArrayLast(comments)

    return Boolean(comment && fallthroughCommentPattern.test(comment.value))
}

// 判断CodePathSegment是否已中断，为false时代表已 return, throw, break 等
function isReachable(segment) {
    return segment.reachable;
}

function hasBlankLinesBetween(node, token) {
    return token.loc.start.line > node.loc.end.line + 1;
}

module.exports = {
    meta: {
        docs: {
            description: "Disallow Case Statement Fallthrough",
            category: "Best Practices",
            recommended: false
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            {
                type: "object",
                properties: {
                    commentPattern: {
                        type: "string",
                        default: ""
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            case: "Expected a 'break' statement before 'case'.",
            default: "Expected a 'break' statement before 'default'."
        }
    },

    create(context) {
        const options = context.options[0] || {};
        let currentCodePath = null;
        const sourceCode = context.getSourceCode();

        let fallthroughCase = null;
        let fallthroughCommentPattern = null;

        if (options.commentPattern) {
            fallthroughCommentPattern = new RegExp(options.commentPattern, "u");
        } else {
            fallthroughCommentPattern = DEFAULT_FALLTHROUGH_COMMENT;
        }

        return {
            onCodePathStart(codePath) {
                currentCodePath = codePath;
            },
            onCodePathEnd() {
                // 保存上层函数或作用域的codePath
                currentCodePath = currentCodePath.upper;
            },

            SwitchCase(node) {
                if (fallthroughCase && !hasFallthroughComment(node, context, fallthroughCommentPattern)) {
                    context.report({
                        messageId: node.test ? "case" : "default",
                        node
                    });
                }
                fallthroughCase = null;
            },

            "SwitchCase:exit"(node) {
                const nextToken = sourceCode.getTokenAfter(node);

                // codePath是否已被 return 等中断
                // case:后面是否有语句
                // 和下一个token，即case 是否有空行
                // 该node是否switch的最后一个case
                if (currentCodePath.currentSegments.some(isReachable) &&
                    (node.consequent.length > 0 || hasBlankLinesBetween(node, nextToken)) &&
                    getArrayLast(node.parent.cases) !== node) {
                    fallthroughCase = node;
                }
            }
        };
    }
};
