Package.describe({
  name: 'meteor-steam:minisql',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'null'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1');
  api.addFiles(['minisql.js', 'alasql.min.js'], 'client');
  api.export('db', 'client');
});
