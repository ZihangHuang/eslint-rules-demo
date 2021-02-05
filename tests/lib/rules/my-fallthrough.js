/**
 * @fileoverview Disallow Case Statement Fallthrough
 * @author my-fallthrough
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/my-fallthrough"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("my-fallthrough", rule, {

    valid: [
        "switch(1) { case 0: a(); /* my-fallthrough */ case 1: b(); }",
        {
            code: "switch(1) { case 0: a(); /* his-fallthrough */ case 1: b(); }",
            options: [{
                commentPattern: 'his-fallthrough'
            }]
        }
    ],

    invalid: [
        {
            code: "switch(1) { case 0: a();\ncase 1: b() }",
            errors: [{
                messageId: "case",
                type: "SwitchCase",
                line: 2,
                column: 1
            }]
        }
    ]
});