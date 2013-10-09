(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Tip of the Day App
     * View a new Rally tip every day
     */
    Ext.define('Rally.apps.tipoftheday.TipOfTheDayApp', {
        extend: 'Rally.app.App',

        layout: 'auto',

        appName: 'Tip of the Day',

        cls: 'tip-of-the-day-app',

        launch: function() {

            var tips = [];

            tips.push('A product owner is the member of the team responsible for accepting user stories.');
            tips.push('When you add a child to a user story on the Backlog page, the parent will "disappear" because the Backlog only shows leaf stories.  Add the Parent column to see the context of the parent.');
            tips.push('"Iteration" is another word for "Sprint."');
            tips.push('Try to keep a consistent rhythm of iteration lengths (for example, two weeks) and only adjust the length after a few retrospective meetings indicate that the length is an issue.');
            tips.push('Remember the Backlog page only shows unscheduled stories. That story you think you lost might be in an iteration or release.');
            tips.push('Something to ponder:  Do you need traceability if you are always working on the most important thing?');
            tips.push('If you find all your stories have similar acceptance criteria, maybe you need to move those to your Definition of Done.');
            tips.push('If you find yourself splitting stories a lot at the end of the iteration, maybe it\'s time to think about breaking them down into smaller stories during iteration planning (or earlier).');
            tips.push('If you didn\'t meet your commitments in the last iteration, don\'t plan for the same velocity in the next iteration.');
            tips.push('Just because Rally can send an email notification doesn\'t mean you should stop talking to each other.');
            tips.push('Yes, a daily standup is supposed to take place daily. :)');
            tips.push('You should still have your daily standup even if your product owner or scrummaster is out or unavailable.');
            tips.push('QA needs to be present in your iteration planning meetings so that they can discuss and contribute to the acceptance criteria that they will be testing.');
            tips.push('Hover over an ID to see the description in context without having to go to the detail page.');
            tips.push('The process of tasking out user stories can bring up issues and edge cases that you didn\'t think of and can help you refine your estimate.');
            tips.push('User stories are typically estimated using relative story points. Tasks are typically estimated using hours.');
            tips.push('When estimating tasks, think in intervals of 1, 2, 4, 8 hours.');
            tips.push('Tasks should not take longer than a day - otherwise, they should be user stories.');
            tips.push('A user story should take just a couple of days complete. If your stories are taking more than a week, consider breaking them down into smaller stories.');
            tips.push('Custom grids on your dashboard can show you pretty much anything you could ever want to see. Have fun!');
            tips.push('Entered a defect but meant for it to be a user story? Convert it!');
            tips.push('Save time with in-place edit. Most grids in Rally can be edited by double-clicking.');
            tips.push('Have an idea to extend or customize Rally? Go to developer.rallydev.com.');
            tips.push('Stories should be accepted *before* the demo - only demo accepted stories.');
            tips.push('The Velocity Chart can make visible that stories are being accepted *after* the sprint ends, and whether the team is achieving a steady (predictable) velocity.');
            tips.push('Rank tasks in order to indicate sequencing.');
            tips.push('At your stand-up, instead of reporting person-by-person, report story-by-story while looking at iteration status page or task board. And don\'t forget to review the Burndown Chart.');
            tips.push('Stop starting and start finishing.');
            tips.push('What are you going to finish today?');
            tips.push('Have you talked to your team today?');
            tips.push('Globally distributed? Go check out your team\'s profiles and get to know them.');
            tips.push('Have you considered adding your Definition of Done to a shared dashboard?');
            tips.push('Don\'t be afraid to ask your teammate whether they need help. Sometimes it\'s tough to realize when you\'re 20 feet deep in a deep, dark rathole.');
            tips.push('Yes, it\'s cliche, but quality really is everyone\'s job. Developers should work with QA before the code is complete and Product Owners should jump in to help test when QA is busy.');
            tips.push('Think of a "project" in Rally as a persistent team, rather than a project with an end date.');
            tips.push('If you have multiple teams working in the same codebase, consider holding a "scrum of scrums (SOS)" meeting in addition to your daily standup to report on dependencies. ');
            tips.push('A typical retrospective meeting will ask: What\'s working well? What could be improved? Action items will be created and assigned.');
            tips.push('In Scrum, "velocity" is how many story points you accepted in an iteration. In Continuous Flow (Kanban), "throughput" is the count of stories that are accepted over a given timeframe.');
            tips.push('User Experience can fit into agile, as long as product management works with UX in advance of the sprint and gives them the flexibility to work with the team during and after the sprint to integrate usability testing recommendations.');
            tips.push('Product owners should be accessible to the team to answer questions as they arise; between 4 and 8 hours of availability a day is recommended.');
            tips.push('Product owners spend a lot of time in meetings, but they\'re not always busy. Don\'t hesitate to interrupt them with a text.');
            tips.push('Doing Continuous Flow (Kanban) does not mean that you don\'t have to plan anymore.');
            tips.push('Did you know that Rally has a Kanban board?');
            tips.push('Did you know that you can change your default project on your profile?');
            tips.push('Did you know that you can change your default landing page on your profile?');
            tips.push('Rally\'s estimation board app can help your team visualize the relative sizes of user stories and estimate more quickly.');
            tips.push('You can use a short name for a user story but in the description, use the format "As a *type of user*, I want *some activity* so that *some goal*."');
            tips.push('In order for a retrospective meeting to be valuable, all team members must feel safe enough to voice their opinions. Consider excluding leaders if it will help the team be more candid.');
            tips.push('Team members do not have a capacity of 8 hours a day. Meetings, lunch, bathroom breaks - you\'re looking at 4-6 hours if you\'re lucky. ');
            tips.push('Estimated ideal hours are not the same as work hours. Most developers complete about 15 estimated hours worth of tasks in a normal 40-hour work week.');
            tips.push('The field "Planned Velocity" on an iteration and release represents the number of points that you expect to get done based on your historical velocity.');
            tips.push('Try to synchronize iterations across multiple teams to take advantage of Rally\'s roll-up reporting.');
            tips.push('If team members feel "unsafe" during a retrospective meeting, try writing thoughts down anonymously on sticky notes.');
            tips.push('In Continuous Flow (Kanban), a low Work in Progress (WIP) limit ensures that you\'re not killing your productivity by multi-tasking too much. You can apply that same discipline within Scrum.');
            tips.push('Do you know your "Definition of Done"? Are all defects closed? Are tests passing? Are all acceptance criteria met? Has the product owner reviewed the feature? What else?');
            tips.push('In order for releases and iterations to roll-up properly across projects, the name and the dates need to match exactly.');
            tips.push('Did you accidentally delete a user story or defect? You can recover them in the Recycle Bin, located at the bottom-right of the screen.');
            tips.push('Administrators can edit, delete, and archive tags.');
            tips.push('Having a tough day and could use some comic relief? Add the "More Cowbell" app to your dashboard for a laugh.');
            tips.push('Are a few strong personalities dominating your meetings? Consider a round-robin approach or silent sticky writing activity to solicit opinions from less vocal team members.');
            tips.push('Is your product owner also your scrummaster? Make sure you don\'t have a conflict of interest.');
            tips.push('If you are on a page that you want someone else to see, copy the link from the address bar and email it to them.');
            tips.push('Are you a member of two teams? Open a separate browser tab for each team.');
            tips.push('You don\'t necessarily need to estimate your tasks to plan accurately.');
            tips.push('In agile, measuring the value to the customer is more important than measuring hours of time spent.');
            tips.push('When editing values in a custom grid apps, you can hit Return/Enter to start editing the next row.');
            tips.push('Custom grids have extremely powerful filtering capabilities.');
            tips.push('Charts added to your dashboard often have more configuration options than those on the Reports tab.');
            tips.push('Use Workspaces in Rally with care because there no roll-ups across workspaces. (Enterprise Edition or higher)');
            tips.push('The Product Owner is responsible for creating and prioritizing the backlog of user stories and defects.');
            tips.push('As a product owner, being available to your team is critical. Consider providing your cell phone number and encourage the team to text with questions when you have to be in meetings.');
            tips.push('Consider implementing pair programming practices or a rule of "two sets of eyes" on all code prior to checking it in.');
            tips.push('Great agile teams have three common characteristics: they are cross-functional; people are dedicated full-time; and membership is stable.');
            tips.push('Estimating the size and scope of new work can be difficult, especially with a new team. Hang in there - estimation will become easier with time.');
            tips.push('Some teams may relate user story points with actual work hours. Avoid this mistake! Use abstract values such as t-shirt sizes, colors, or points to represent the size of new work.');
            tips.push('Expect and commit to spending 20% of available work hours planning in order to be successful.');
            tips.push('Schedule backlog grooming, daily standup, iteration planning, and release planning meetings. ');
            tips.push('Agile isn\'t about delivering software faster; it\'s about delivering quality software faster.');
            tips.push('With testers sitting on your cross-functional team, testing can begin immediately rather than wait until after development is complete.');
            tips.push('True team empowerment means the team makes the decisions that impact commitment. ');
            tips.push('The business does not tell the team what to do, but instead provides data on what is most important.');
            tips.push('When the team has a prioritized list of requests, instead of a set of directives, they become part of the process.');
            tips.push('At the end of an iteration, host a demo meeting with the organization to show the work your team has completed.');
            tips.push('Eliminate personal metrics. You win and lose as a group.');
            tips.push('A truly cross-functional team has all of the necessary skills to move a user story to completion.');
            tips.push('Challenge yourself to keep teams together through each month, quarter, or even year.');
            tips.push('If your team members don\'t talk to each other regularly each day, trouble lies ahead.');
            tips.push('Even with the most meticulous documentation, the best way to discover issues and blockers is through face-to-face communication.');
            tips.push('Use video conference and instant messenger software to create a virtual room for distributed teams.');
            tips.push('A brief, face-to-face daily meeting among all team members serves to let everyone know what work happened yesterday, what work is planned for today, and what issues may prevent work from happening. ');
            tips.push('Once user stories are sized and committed to in an iteration, individual capacity comes into play in the form of hourly task estimates.');
            tips.push('Sustainable change happens iteratively and incrementally. ');
            tips.push('Resources are people. People work best with others. Teams work best when stable.');
            tips.push('Agility depends on bottom-up empowered lines of communication and collaboration.');
            tips.push('Read the flare messages at the top of the pages, they provide links to places.');
            tips.push('Explore the apps - they are very powerful.');
            tips.push('Delete Recycle Bin items every few days.');
            tips.push('Use Test Folders to organize regression tests. (Rally Quality Manager)');
            tips.push('Use Test Sets to organize regression tests for acceptance testing. (Rally Quality Manager)');
            tips.push('Organize iteration tests in test sets on the Iteration Test Status page. (Rally Quality Manager)');
            tips.push('Action items won\'t get done without someone tracking them and following up.');
            tips.push('Rat Hole Alert!  Watch for rat holes. Help each other!');
            tips.push('Don\'t be afraid to ask questions!');
            tips.push('Organize patch defects in defect suites. (Enterprise Edition or higher)');
            tips.push('Don\'t like our fields or need one just for your company? Create a custom field.');
            tips.push('Rally has tons of integrations to other tools. Search "integration" in Help to learn more.');
            tips.push('Use the Iteration Summary app to see a quick status of the iteration in terms of % accepted, open defects, and test case results.');
            tips.push('Testers are good at thinking of acceptance criteria nobody else will remember. Make sure they\'re talking during iteration planning.');
            tips.push('Focus on just one or two action items out a retrospective so you can actually get them done quickly.');
            tips.push('You can use Rally\'s Kanban board even if you\'re doing Scrum - the policies provide a handy place to post your Definition of Done.');
            tips.push('Use velocity to predict how much a team will get done in the future. Use throughput and cycle time to measure productivity and effectiveness.');

            var randomNumber = Math.floor(Math.random()*(tips.length-1));
            var template = new Ext.Template([
                '<div class="tipheader">Rally Tip #' + randomNumber + '</div>',
                '<div class="tipcontent">' + tips[randomNumber] + '</div>'
            ]);

            this.update(template);
          }

        });
})();
