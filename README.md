metalsmith-handlebars-layouts
===========================

Wraps page contents in a layout. Safe to use with live reload systems, like [metalsmith-serve](https://github.com/mayo/metalsmith-serve). Similar to [metalsmith-nested](https://github.com/firesideguru/metalsmith-nested) but also is safe for live reloads and you point at the parent/ancestor instead of the child/descendant.


What It Does
------------

Most sites repeat the header and footer on each of their pages. This plugin takes the header and footer out of the page and puts them into separate files. The plugin is straightforward to use and doesn't dictate any decisions outside of using handlebars for the layouts.

Example content file, 'src/page.html':

    ---
    layout: page.md
    title: Just Testing
    color: blue
    ---

    Hi, this is my page.

    * Red
    * Green
    * {{color}}


Here's a layout file, 'layouts/page.md':

    <html><head><title>{{title}}</title></head>
    <body>
    {{{contents}}}
    </body></html>

The resulting file object (`dest/page.html`) would look like this:

    <html><head><title>Just Testing</title></head>
    <body>

    <p>Hi, this is my page.</p>

    <ul>
    <li>Red</li>
    <li>Green</li>
    <li>{{color}}</li>

    </ul>
    </body></html>

Under the hood, the contents of the file are inserted into the layout, then the file object is updated with the new contents and other plugins can continue with processing. If you notice carefully, the `{{color}}` replacement was not performed. That's because the contents must be completely ready before insertion into the layouts. If you like, you can look at [metalsmith-handlebars-contents](https://github.com/fidian/metalsmith-handlebars-contents) to do that replacement for you.

Partials can also be used for organization of layouts. This will run the layout for each file, so the file's metadata can also change how the layout looks.


Installation
------------

`npm` can do this for you.

    npm install --save metalsmith-handlebars-layouts


Usage
-----

Include this like you would include any other plugin.  Here's a CLI example that also shows the default options.  You don't need to specify any of these unless you want to change its value.

    {
        "plugins": {
            "metalsmith-handlebars-layouts": {
                "data": [],
                "decorators": [],
                "helpers": [],
                "layouts": "./layouts/",
                "match": "**/*.html",
                "matchOptions": {},
                "partials": ["./layouts/partials/**/*"]
            }
        }
    }

And this is how you use it in JavaScript, with a small description of each option.

    // Load this, just like other plugins.
    var handlebarsLayouts = require("metalsmith-handlebars-layouts");

    // Then in your list of plugins you use it.
    .use(handlebarsLayouts())

    // Alternately, you can specify options.  The values shown here are
    // the defaults.
    .use(handlebarsLayouts({
        // Data files to load or data objects to add to global data.
        data: [],

        // Decorators to add
        decorators: [],

        // Helper functions to include
        helpers: [],

        // Directory that holds layouts, outside of the src/ folder.
        // Does not recurse and only finds top-level files.
        layouts: './layouts/',

        // Pattern of files to match in case you want to limit processing
        // to specific files.
        match: "**/*.html",

        // Options for matching files.  See metalsmith-plugin-kit for
        // more information.
        matchOptions: {},

        // Directories that hold partials for processing the content
        partials: ['./layouts/partials/**/*']
    })

The items in the `data`, `decorators`, `helpers`, and `partials` arrays can be strings or objects. They are passed to [handlebars-wax] using the appropriate method.

This uses [metalsmith-plugin-kit](https://github.com/tests-always-included/metalsmith-plugin-kit) to match files.  The `.matchOptions` object can be filled with options to control how files are matched.


Development
-----------

This plugin is licensed under the [MIT License][License] with an additional non-advertising clause.  See the [full license text][License] for information.

[handlebars-wax]: https://github.com/shannonmoeller/handlebars-wax
