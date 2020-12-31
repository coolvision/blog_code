const markdownIt = require("markdown-it");

module.exports = function(config) {

    config.addPassthroughCopy("assets");
    config.addPassthroughCopy("lib");
    // config.addPassthroughCopy({"./../program_synthesis/inductive_demo": "inductive_demo"});
    // config.addPassthroughCopy({"./../program_synthesis/lib/program_generation": "program_generation"});

    // config.addPassthroughCopy({"./program_synthesis/inductive_demo": "inductive_demo"});
    // config.addPassthroughCopy({"./program_synthesis/lib/program_generation": "program_generation"});

    config.addPassthroughCopy({"./aflow/*.js": "./aflow"});
    config.addPassthroughCopy({"./aflow/*.css": "./aflow"});
    config.addPassthroughCopy({"./actor_based/*.js": "./actor_based"});
    config.addPassthroughCopy({"./actor_based/*.css": "./actor_based"});
    config.addPassthroughCopy({"./creative_code_synthesis/*.js": "./creative_code_synthesis"});
    config.addPassthroughCopy({"./creative_code_synthesis/*.css": "./creative_code_synthesis"});
    config.addPassthroughCopy({"./creative_code_synthesis/3d_images_selected/*.png": "./creative_code_synthesis/3d_images_selected"});
    config.addPassthroughCopy({"./inductive_program_synthesis/*.js": "./inductive_program_synthesis"});
    config.addPassthroughCopy({"./program_generation/*.js": "./program_generation"});

    // config.addPassthroughCopy("../program_synthesis/inductive_demo");

	// config.addPassthroughCopy("**/*.js");


	let mdIt = markdownIt({
		html: true,
		breaks: true,
		linkify: true
	})
    config.setLibrary("md", mdIt);
    config.addPairedShortcode("markdown", function(content) {
        return mdIt.render(content);
    });

    return {
        dir: {
            // input: ".",
            includes: "includes"
        },
        templateFormats : ["md", "njk"],
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk"
    };
};
