This project is still under development and will likely contain minor bugs. We are targeting 4/26/2015 as our stable release date.

# meteor-postgres
Postgres integration for Meteor


![Postgres](https://s3-us-west-1.amazonaws.com/treebookicons/postgresql_logo.jpg "Postgres")![Meteor](https://s3-us-west-1.amazonaws.com/treebookicons/meteor-logo.png  "Meteor")

Included in this repo is a sample-todos application to serve as an example.

Reactive Postgres for Meteor.

# Installation

Run the following from a command line

    meteor add meteorsteam:meteor-postgres

If you want to make modifications to our package for your project, clone this repo and include the /pacakges/meteor-postgres folder in your /pacakges.

Either way you will need to add the following to .meteor/packages

    meteorsteam:meteor-postgres



# Implementation

The ORM is designed after Ruby's [active record](https://github.com/rails/rails/tree/master/activerecord). MiniSQL is implemented using [alasql](https://github.com/agershun/alasql).

# Usage

Defining the SQL collection on both server and client. Pass in the postgres connection string, which will only be used on the server.

    tasks = new SQL.Collection('tasks', 'postgres://username:password@localhost/database');
    // replaces Mongo.Collection('tasks');

Defining the schema on the client for the tables and creating the table. These tables are not persistent.

    var taskTable = {
      _id: ['INT', 'PRIMARY KEY'],
      text: ['varchar (255)', 'not null'],
      checked: ['BOOL', 'DEFAULT true']
    };
    tasks.createTable('tasks', taskTable);

Seperately we will need to create the table on the server. See the [wiki](https://github.com/meteor-stream/meteor-postgres/wiki/Getting-Started) for official documentation.

    tasks.ActiveRecord.createTable({text: ['$string'], checked: ["$bool", {$default: false}]}).save();


On the server the cursor needs to be created and published

    Meteor.publish('tasks', function () {

      var cursor = {};
      cursor._publishCursor = function(sub) {

        tasks.select('tasks.id as id', 'tasks.text', 'tasks.checked', 'tasks.createdat', 'users1.id as users1id', 'users1.name')
             .join(['INNER JOIN'], ["users1id"], [["users1", 'id']])
             .order('createdat DESC')
             .limit(10)
             .autoSelect(sub);
      };
      cursor.autoSelect = tasks.select('tasks.id as id', 'tasks.text', 'tasks.checked', 'tasks.createdat', 'users1.id as users1id', 'users1.name')
                               .join('INNER JOIN', ['id'], ['users1:id'])
                               .order('createdat DESC')
                               .limit(10)
                               .autoSelect;
      return cursor;
    });

One limitation of our current implementation is that client does not transmit data to the server using ddp. Instead after the data is inserted into the local miniSQL database it triggers a call to the server side method named {{tablename}}+"save". We cannot know what the users will call the collection so the user needs to specify the following Meteor.methods in order for this implementation to work

    Meteor.methods({
      taskssave: function(input, dataArray) {
        tasks.save(input, dataArray);
      },
      users1save: function(input, dataArray) {
        users1.fetch(input, dataArray);
      },
    });


After that configuration the remote and local databases will remain synchronized.


On the client:
Selecting

    tasks: function () {
      var uTasks = tasks.select('tasks.id', 'tasks.text', 'tasks.checked', 'tasks.createdat', 'users1.name')
                        .join(['OUTER JOIN'], ['users1id'], [['users1', ['id']]])
                        .fetch('client');
      return uTasks;
    },

Inserting

    tasks.insert({
      text:text,
      checked:false,
      users1id: user
    }).save();

Updating

    tasks.update({id: this.id, "checked": !this.checked})
         .where("id = ?", this.id)
         .save();

Removing

    tasks.remove()
         .where("id = ?", this.id)
         .save();

# License
Released under the MIT license. See the LICENSE file for more info.