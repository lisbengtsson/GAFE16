module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-ts");

  var rootPath = "source/gafe/ts/";
  var modules = ["gafe"];

  var c = { ts: {} };

  for (var i = 0; i < modules.length; i++) {
    var m = modules[i];
    c.ts[m] = {
      src: [rootPath + "apps/" + m + "/**/*.ts", "!" + rootPath + "/typings/**/*.*"],
      html: [rootPath + "apps/" + m + "/**/*.tpl.html"],
      reference: rootPath + "apps/" + m + "/reference.ts",
      out: "js/" + m + ".js",
      options: { noImplicitAny: false, sourceMap: false }
    };
  }

  grunt.initConfig(c);
}