# YOUR PRODUCT/TEAM NAME: tempTracker

> _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.        
>        
> _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.

## Iteration XX - Review & Retrospect

* When: August 3, 2025  
* Where: Online 

## Process - Reflection

Sprint 4 was focused on finalizing our product, polishing our UI/UX and completing the list of tasks to not only meet our MVP but go beyond. This Sprint finalized all functionaliities of this project, including a finalized map/temperature plotting/analysing component and related display properties. In addition to the main functionality described above, the team decided to emphasis the community aspect of the app by adding multiple new features for users to stand out. This includes a fully integrated photo gallery feature, where users can upload, like, unlike, and view photos submitted by other users of the great lake. It also included a flesh-out Points of Interest feature based on your location, a new settings page with toggles to enable optional community invites and notifications, access to other users’ profile, and much more. With these changes implemented, our team was able to finalize and ship a fully functional app that mimics an industry-standard piece of software,

In terms of scalability and software design, we ensured to take the best approaches along the way. Vertical scaling is the primary scaling method for our monolithic app, as Supabase automatically scales to fit our needs, and GLOW uses Supabase buckets, RLS policies, and authentication for a large part of the functionality. We also transitioned to an Express backend that uses Supabase, allowing us to have an extra layer to manage REST endpoints, add error handling, and future metrics as needed.   

#### Decisions that turned out well

1. For this Sprint, we stayed active immediately after the last Sprint concluded. In previous Sprints, it took one-to-two days after each iteration for the team to regroup and prioritize, but with Sprint 4 being the last iteration dn all features needed to be implemented, we wanted to start quickly.

Our first spring meeting was the very next day after Sprint 3 ended, and this decision ended up being very crucial because we were able to identify a potential issue moving forward. Querying user submitted-points with our current schema and architecture was very computationally heavy, and we realised we would need another way to store data. Since we had an early eye on the problem, we were able to come up with a solution quickly, and use the PostgreSQL extension, POSTGIS to resolve the issue. This is just one example, but the early start made allowed us to keep momentum and continue working on the features that were not topped-off in the last iteration.

[Confluence Notes of Initial Sprint](https://c01s25temptracker.atlassian.net/wiki/spaces/SCRUM/pages/11468801/2025-07-23+Meeting+Notes)

Enabled POSTGIS extension and generated spatial reference table for storing locations.
![POI Example](https://drive.google.com/uc?export=view&id=1TvRHMru6NT8hvQ4dztUu_VpZ3IU9jGzn)

2. Another team organization change that we implemented throughout our workflow was sharing context. In our last few iterations, the team realised that a lot of the work was being done in isolation. For example, the map primarily had one member assigned throughout the last iteration, and when we realised there was a blocker, other members struggled to help due to the lack of context. In this Sprint, we encouraged more communication between members, and allowed each other to work on feature branches simultaneously. This ensured that all members had knowledge of how each part of the app worked, and any refactors/major changes did not cause any major roadblocks.

For example, the map trends feature was initially developed from 2 PRs from two different members. 

[https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/pull/93](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/pull/93) 

[https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/pull/95](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/pull/95) 

#### Decisions that did not turn out as well as we hoped

1. Similar to an unsuccessful decision from last sprint, we continued creating service classes in both our frontend and backend. Using the SUpabase SDK and its frontend client, we are able to interact with our routes and database directly from the frontend, which is why we initially had lots of frontend service classes. However, to add a separate backend layer we decided to migrate to an Express.js dedicated backend server as well. Although not a large issue, this meant multiple parts of our services were in different areas of the codebase, and we had to allocate resources to refactor them accordingly, after the services were already made (costing some extra time).

[Example Refactor PR in Retrospect](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/pull/91) 

2. Leaving some unit tests for the end

Although we encouraged ourselves to continuously test our code as we shipped, a large number of our frontend components (along with our backend routes) did not receive full unit test files until after they had been merged into develop. Luckily, since we had already locally tested before shipping, this did not have any notable issues in our working state of the app, but extra unit tests throughout could have been helpful as an additional safeguard.

[Frontend test files from the develop branch](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01s25-project-temptracker/tree/develop/client/tests)  

#### Planned changes

1. We are not making any major process-related changes after this Sprint. Since this Sprint concludes all iterations of developing this project, we have to instead review our development and reflect on how our process could be changed for future projects. In hindsight, we believe our team had good project organization, combining both GitHub issues, Jira, Confluence and our own Google Docs to manage the development of GLOW.

## Product - Review

#### Goals and/or tasks that were met/completed:

1. Map (user trends)  
   1. Users can click on a data point on the map and bring up a trend chart showing temperature trends in the area  
   2. There is a button that can be clicked to bring up the graph  
   3. Found in /map

2. Send progress email  
   1. This is integrated into the admin section, where admins can send updates on new features for the Temperature Tracker  
   2. Users can choose to opt out  
   3. Found in /server/services and /client/components and /client/app

3. Settings Page  
   1. Users are able to add/change their profile picture as well as change their email preferences to allow users more control over their account  
   2. Also allows account deletion  
   3. Found in /client/app

4. Point of Interest system  
   1. Shows nearby beaches as well as their temperatures depending on user location   
   2. Found in /client/app

5. Location service  
   1. Prompts user for their location and uses it to autofill for temperature upload, as well as detecting POIs  
   2. Found in /client/components  

6. Photo Upload System  
   1. Users can upload photos alongside temperature entries, tagging them with POIs.  
   2. Other users are able to view and like uploaded photos  
   3. Located in /client/app

#### Goals and/or tasks that were planned but not met/completed:

1. The Points of Interest feature was still implemented, but to a reduced scale than what was initially planned. Originally, we hoped to find a large dataset of public beaches/water spots in the Great Lakes region, but unfortunately we were unable to find a dataset like this. We discussed using a public API to get these points, but many of the available ones did not fit our needs perfectly, or were locked over heavy token costs. As a compromise, we were able to find a smaller dataset with rougher coordinates, but realised this fit our business needs.  

2. The photo gallery feature was also slightly scaled down to what was initially proposed. Due to file size constraints and limited storage in Supabase Buckets, we had to restrict users to a file size and upload limit. We decide that this does not affect the functionality of the app, as the photo gallery was already intended to be an additional, community-driven feature and all other aspects including filtering, liking, unliking and posting were implemented in a scalable fashion.

## Meeting Highlights

Going into the next iteration, our main insights are:

* Sprint 4 was the last iteration for the development of the GLOW app. Our team is extremely satisfied with the final product as it not only covers the MVP listed earlier, but adds many additional features and drives the app into a platform for staying environmentally aware and promoting water activities in the community. For any future project, we would follow a similar approach and focus on delegating tasks in a similar fashion.

* For any future task, our team may align with prioritizing GitHub Projects and creating issues, rather than using Atlassian products like Jira, which typically add bloat for small-to-medium sized teams and projects like GLOW. In the end however, the TempTracker team is satisfied with the product.
