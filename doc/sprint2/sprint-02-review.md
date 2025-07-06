# YOUR PRODUCT/TEAM NAME: tempTracker

 \> \_Note:\_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.        
 \>        
 \> \_Suggestion:\_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.

## Iteration XX \- Review & Retrospect

 * When: July 5, 2025  
 * Where: Online 

## Process \- Reflection

Sprint 2 was focused on continuing the development of the MVP for the GLOW app. This Sprint finalized the main functionalities of the project including the upload CSV (and bulk upload), fixing Supabase policies and added oAuth for login. We also made a profile page so users can see their own submission data, as well as an admin page for admins to verify submission data. 

In terms of future scalability and a reliable app, we also added a username field for sign-in/registration, which will help us track users by another unique identifier and help in the gamification part of the MVP in a future iteration. In terms of QOL and UX, the group also added an about page, upgraded the navigation, added theme controls, and ensured overall styling and consistency between all components.

#### Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

 * 2 \- 4 decisions.  
 * Ordered from most to least important.  
 * Explain why (i.e. give a supporting argument) you consider a decision to be successful.  
 * Feel free to refer/link to process artifact(s).

1. One of the most important decisions in terms of project organization, reorganize our Jira backlog/sprint and our GitHub Projects. We Used Jira for high level user stories, and tracked the available features intended for users, while keeping our GitHub issues as lower-level implementation tasks, to keep track of our progress from a development standpoint. I think this was the most important because it helped us organize our core features and allowed us to assign it to team members to get them completed promptly. 

[GitHub Projects Board](https://github.com/orgs/UTSC-CSCC01-Software-Engineering-I/projects/3)  
[Jira Backlog](https://c01s25temptracker.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog) 

2. We chose to assign only 1 task to each team member at a time to increase sequential development. Although isolating tasks can be daunting, after every individual feature was done on a feature branch, we held meetings (sync and async) to discuss the changes and worked together to integrate into our develop branch. During these discussions, we would also refactor our code to ensure that the different styles remained consistent and efficient. This made our project workflow more organized and allowed for better quality code. This separation of concerns allowed us to increase productivity and finish more tasks in the allotted time. 

[Subset of Separated Issues (View both open and closed)](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/issues) 

#### Decisions that did not turn out as well as we hoped

List process-related (i.e. team organization) decisions that, in retrospect, were not as successful as you thought they would be.

 * 2 \- 4 decisions.  
 * Ordered from most to least important.  
 * Feel free to refer/link to process artifact(s).

1. The most important decision that didn’t turn out so well was assigning one person for the map aspect. This was not as successful because the map functionality was a bit more involved and putting the burden one person caused some blocks in development. This also caused lots of context to build up, as now assigning more developers onto the map feature would require them to learn a lot of content before contributing.  
     
2. Another not-so-successful decision was to allow different members to choose their own UI components independently, and then collaborate during the merging process. This was an unsuccessful decision because refactoring the UI and ensuring consistent styling was harder than originally anticipated. Especially with multiple UI libraries and other imports, the challenge of managing these components grew as our app served more pages.

Ex: [client/app/globals.css](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/blob/develop/client/app/globals.css), has both TailwindV4 styling syntax, and basic root styling 

#### Planned changes

List any process-related changes you are planning to make (if there are any)

 * Ordered from most to least important.  
 * Explain why you are making a change.

1. We are not making any major process-related changes after this Sprint. We believe our development workflow and project management (supplied with Jira and GitHub projects) is an efficient way to keep track of high-level feature prioritizations and specific program-related tasks. Our process worked well over the course of this iteration, and most of the features we intended to finish were included.

## Product \- Review

#### Goals and/or tasks that were met/completed:

 * From most to least important.  
 * Refer/link to artifact(s) that show that a goal/task was met/completed.  
 * If a goal/task was not part of the original iteration plan, please mention it.

1. The temperature upload form was finalized and the previously made frontend was now linked to the PostgreSQL database. The form is vital for the MVP as it allows users to submit data to populate the map. In accordance with our goal, we also finished the CSV upload for admins. In accordance with our metrics, we have a 100% read/write success rate and our API calls are working accordingly (0 Auth/Temperature related 500- or 400- statuses). [Supabase (May not have access)](https://supabase.com/dashboard/project/vertksxuryrywouipodt/logs/edge-logs?its=2025-07-05T19:28:21.764Z&ite=&f={%22status_code%22:{%22error%22:false,%22success%22:true) 

![Supabase Database Req](https://drive.google.com/uc?export=view&id=1BAtybJtwpx2l-AqbLvq84eg8dG1fyTBb)

![Supabase Req](https://drive.google.com/uc?export=view&id=135eNJOzC0OntZkxpUi0zqZW_k-hWeJJJ)

2. User Authentication was mostly implemented, with OAuth being enabled as an additional sign-in partner. Usernames are collected for manual sign-ins, but the only current limitation is not prompting OAuth users to create one upon first entry. Despite that, the profile and related pages all work accordingly, and Supabase metrics do not show any vulnerabilities in this regard. *Supabase successful auth rates shown below*.

![Auth Req](https://drive.google.com/uc?export=view&id=1uuiZ-XutQ3dzSGozheCa0efiojcqpy88)

3. An about page that contains the overall incentive/mission statement of the app was created. This page serves as a landing page and includes statistics and information presented in a very accessible and high-UX way.

*Found at `client\\app\\about\\page.tsx`*

#### Goals and/or tasks that were planned but not met/completed:

 * From most to least important.  
 * For each goal/task, explain why it was not met/completed.        
   e.g. Did you change your mind, or did you just not get to it yet?

1. Although lots of progress was made on the map feature, the full goal was not met in accordance. The current map feature does have a slider to access dates throughout time, and does have temperature plotting and data interpolation, so it was not a failure by any means. The reason the goal was not met was because we should have assigned more of our team, as the feature was more involved than originally thought. In terms of metrics, we were not able to have full load testing (adding 1 million + points), adding point pagination, or thorough testing in general.
 
## Meeting Highlights

Going into the next iteration, our main insights are:

 * 2 \- 4 items  
 * Short (no more than one short paragraph per item)  
 * High-level concepts that should guide your work for the next iteration.  
 * These concepts should help you decide on where to focus your efforts.  
 * Can be related to product and/or process.

**1- Try and ensure more consistency btween group members.**

- To continue building our app, we want to ensure each member has content on every part of the app. Currently, our app was built in isolation, which was good for speed, but now we are running into large tasks that require more work. For example, the map feature was currently assigned to one member, and now to continue working on it we would need to share a lot of context to get all team members on the same page. This also affects the product as well, as different pages are being implemented with different styling patterns, and we want to ensure a consistent UX.

**2- Proritize Feature List and Documentation**

- Throughout the development process, our group often strayed from the goals we made initially and worked on multiple aspects of the project. In the next iteration, we want to be close to finishing the MVP of our app. This includes prioritizing the map feature, showing user’s their information, and having an archive feature as well. This new sense of prioritization should also be included into our project deliverables, as our group often leaves these important pieces of documentation to be either rewritten or revised at the end of a given sprint.
