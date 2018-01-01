'use strict';
const superb = require('superb');
const normalizeUrl = require('normalize-url');
const humanizeUrl = require('humanize-url');
const Generator = require('yeoman-generator');
const utils = require('./utils');
const normalizeName = (name) => {
	if(!name.startsWith('basedakp48-connector-')) {
		name = `basedakp48-connector-${name}`;
	}
	return name.toLowerCase();
}

module.exports = class extends Generator {
	init() {
		return this.prompt([{
			name: 'moduleName',
			message: 'What do you want to name your connector?',
			default: 'basedakp48-connector-myplugin',
			validate: (s) => (s.trim().length > 0),
			filter: x => normalizeName(x)
		}, {
			name: 'moduleDescription',
			message: 'What is your connector\'s description?',
			default: `My ${superb()} BasedAKP48 plugin`
		}, {
			name: 'githubUsername',
			message: 'What is your GitHub username?',
			store: true,
			validate: x => x.length > 0 ? true : 'You have to provide a username'
		}, {
			name: 'website',
			message: 'What is the URL of your website?',
			store: true,
			validate: x => x.length > 0 ? true : 'You have to provide a website URL',
			filter: x => normalizeUrl(x)
		}]).then(props => {
			const repoName = utils.repoName(props.moduleName);

			const tpl = {
				moduleName: props.moduleName,
				moduleDescription: props.moduleDescription,
				githubUsername: this.options.org || props.githubUsername,
				repoName,
				name: this.user.git.name(),
				email: this.user.git.email(),
				website: props.website,
				humanizedWebsite: humanizeUrl(props.website)
			};

			const mv = (from, to) => {
				this.fs.move(this.destinationPath(from), this.destinationPath(to));
			};

			this.fs.copyTpl([
				`${this.templatePath()}/**`
			], this.destinationPath(), tpl);

			mv('editorconfig', '.editorconfig');
			mv('gitattributes', '.gitattributes');
			mv('gitignore', '.gitignore');
			mv('_package.json', 'package.json');
		});
	}
	git() {
		this.spawnCommandSync('git', ['init']);
	}
	install() {
		this.installDependencies({bower: false});
	}
};
