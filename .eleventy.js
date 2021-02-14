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
    config.addPassthroughCopy({"./generative_art_synthesis/*.js": "./generative_art_synthesis"});
    config.addPassthroughCopy({"./generative_art_synthesis/*.css": "./generative_art_synthesis"});
	config.addPassthroughCopy({"./generative_art_synthesis/program_generation/*.js": "./generative_art_synthesis/program_generation"});
    config.addPassthroughCopy({"./generative_art_synthesis/3d_images_selected/*.png": "./generative_art_synthesis/3d_images_selected"});
    config.addPassthroughCopy({"./inductive_program_synthesis/*.js": "./inductive_program_synthesis"});
    config.addPassthroughCopy({"./inductive_program_synthesis2/*.js": "./inductive_program_synthesis2"});
	config.addPassthroughCopy({"./inductive_program_synthesis2/*.json": "./inductive_program_synthesis2"});	
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
