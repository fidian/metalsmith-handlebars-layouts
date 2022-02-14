/**
 * Metalsmith Handlebars Layouts - Wrap your content in a layout
 *
 *   var handlebarsLayouts = require("metalsmith-handlebars-layouts");
 *
 *   // Create your Metalsmith instance and add this like other middleware.
 *   metalsmith.use(handlebarsLayouts({
 *       // All options are optional. Defaults are listed here
 *       data: [],
 *       decorators: [],
 *       helpers: [],
 *       layouts: './layouts/',
 *       match: '**' + '/*.html', // Had to break this up to embed in a comment
 *       matchOptions: {},
 *       partials: ['./layouts/partials/**' + '/*']
 *   });
 *
 * `match` and `matchOptions` are used by metalsmith-plugin-kit to match files.
 *
 * Individual items in `data`, `decorators`, `helpers`, and `partials` will be
 * passed to the matching function in handlebars-wax.
 */
"use strict";

var debug, fs, handlebars, handlebarsWax, path, pluginKit;

debug = require("debug")("metalsmith-handlebars-layouts");
fs = require("fs");
path = require("path");
pluginKit = require("metalsmith-plugin-kit");
handlebars = require("handlebars");
handlebarsWax = require("@fidian/handlebars-wax");

function loadTemplates(templateDir, hb) {
    var i;
    var templates = {};
    var dirEntList = fs.readdirSync(templateDir, {
        withFileTypes: true
    });

    dirEntList.forEach(function(dirEnt) {
        var contents;

        if (dirEnt.isFile()) {
            contents = fs.readFileSync(
                path.resolve(templateDir, dirEnt.name),
                "utf8"
            );
            templates[dirEnt.name.replace(/\.[^\.]*$/, "")] = hb.compile(
                contents
            );
        }
    });

    return templates;
}

/**
 * Factory to build middleware for Metalsmith.
 *
 * @param {module:metalsmith-handlebars-layouts~options} options
 * @return {Function}
 */
module.exports = function(options) {
    const waxKeys = ["data", "decorators", "helpers", "partials"];
    var hb, templates;

    options = pluginKit.defaultOptions(
        {
            data: [],
            decorators: [],
            helpers: [],
            layouts: "./layouts/",
            match: "**/*.html",
            matchOptions: {},
            partials: ["./layouts/partials/**/*"]
        },
        options
    );

    waxKeys.forEach((key) => {
        if (!Array.isArray(options[key])) {
            const oldVal = options[key];

            if (oldVal) {
                options[key] = [oldVal];
            } else {
                options[key] = [];
            }
        }
    });

    return pluginKit.middleware({
        before() {
            hb = handlebarsWax(handlebars.create());
            waxKeys.forEach((key) => {
                if (options[key].length) {
                    debug("Loading " + key);
                    options[key].forEach((v) => {
                        try {
                            hb[key](v);
                        } catch (e) {
                            console.log(
                                "Encountered error during initialization: " +
                                    e.toString()
                            );
                        }
                    });
                } else {
                    debug("No config found for " + key);
                }
            });
            debug("Loading layouts");
            templates = loadTemplates(options.layouts, hb);
            debug("Layouts are ready");
        },
        each(filename, file) {
            if (!file.layout) {
                debug("Skipping layout: " + filename);
            } else if (!templates[file.layout]) {
                debug("Layout " + file.layout + " missing: " + filename);
            } else {
                debug("Processing layout " + file.layout + ": " + filename);
                try {
                    file.contents = file.contents.toString();
                    file.contents = Buffer.from(templates[file.layout](file));
                } catch (e) {
                    console.log(
                        "Encountered error while processing " +
                            filename +
                            ": " +
                            e.toString()
                    );
                }
            }
        },
        match: options.match,
        matchOptions: options.matchOptions,
        name: "metalsmith-handlebars-layouts"
    });
};
