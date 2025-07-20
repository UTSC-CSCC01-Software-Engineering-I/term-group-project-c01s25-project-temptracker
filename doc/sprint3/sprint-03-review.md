# YOUR PRODUCT/TEAM NAME: tempTracker

> _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
>      
> _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.

## Iteration XX - Review & Retrospect

 * When: July 19, 2025
 * Where: Online 

## Process - Reflection

Sprint 3 was focused on continuing the development of the MVP for the GLOW app. This Sprint finalized the main functionalities of the project including data interpolation for the interactive map, as well as fixing Supabase policies and added oAuth for usernames. We worked on gamification by adding a community leaderboard for users to see ranks as well as implementing a badge system to reward users for contribution.

In terms of future scalability and a reliable app, we also added a username field for OAuth, which will help us track users by another unique identifier and helps in the gamification part of the MVP.

#### Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

 * 2 - 4 decisions.
 * Ordered from most to least important.
 * Explain why (i.e. give a supporting argument) you consider a decision to be successful.
 * Feel free to refer/link to process artifact(s).

One of the most important decisions in terms of project organization was to create a dedicated backend for our gamification features such as the leaderboard and badges and connect them to supabase, allowing us to automatically track and update user metrics like streaks, badge progress, etc. While improving workflow organization by splitting code between frontend and backend. This can be seen in our client/components and /server.

GitHub Projects Board

Another decision that paid off was assigning 2 team members to work exclusively on the map functionality. This allowed us to focus on solving the maps performance issues, which previously had very long (>5s) load times. By splitting responsibilities between client and server side, the two members were able to work together and give each other ideas on improvements. The division of 2 people allowed rapid debugging, and better understanding of new modules such as GeoJSON and map interpolation. This can be found in /clients/components/map.tsx and /map/app.py in which we used python.

GitHub Projects Board

#### Decisions that did not turn out as well as we hoped

List process-related (i.e. team organization) decisions that, in retrospect, were not as successful as you thought they would be.

 * 2 - 4 decisions.
 * Ordered from most to least important.
 * Feel free to refer/link to process artifact(s).

One of the main mistakes that we made was that we refactored our code into the dedicated backend while frontend testing was being implemented. This overlap in responsibilities led to unnecessary rework. Some unit tests had to be deleted or rewritten entirely due to changes in file structure, route logic, or data-fetching methods. We should have finalized the backend structure first, or coordinated more closely between testing and refactoring tasks. This would have prevented misalignment and allowed us to save time while preserving the initial unit tests. This can be seen in tests/frontend branch and develop branch.

Ex: tests/frontend branch and develop branch.

Another mistake was our lack of a dedicated backend, especially for Ci/Cd purposes in assignment 2. As a result, we struggled to properly test the frontend and backend in isolation since they were so closely meshed together. Additionally, this caused delays when we finally decided to implement a dedicated backend, since many frontend components had to be refactored. From this we learned that in future iterations, we should create a dedicated backend and establish the endpoints early, to support a smoother frontend development process. The refactoring is shown in our last few commits in develop branch.
Ex: /server

#### Planned changes

List any process-related changes you are planning to make (if there are any)

 * Ordered from most to least important.
 * Explain why you are making a change.

We are not making any major process-related changes after this Sprint. We believe our development workflow and project management (supplied with Jira and GitHub projects) is an efficient way to keep track of high-level feature prioritizations and specific program-related tasks. Our process worked well over the course of this iteration, and most of the features we intended to finish were included.

## Product - Review

#### Goals and/or tasks that were met/completed:

 * From most to least important.
 * Refer/link to artifact(s) that show that a goal/task was met/completed.
 * If a goal/task was not part of the original iteration plan, please mention it.

**Leaderboard**  
The leaderboard is a table of the top 30 users with the most temperature uploads, likes on posts (WIP), and max streak. The data is queried from the DB and filters above the frontend table let us toggle between ranking based on the different metrics.  
![Leaderboard](https://drive.google.com/uc?export=view&id=1gicYaFixO2ZRVvTSkyvIpzKFChCsFx0Q)

**Updated Profile**  
The profile page also summarizes a user’s stats, including their streak and place on the global ranking. It also displays their earned badges (WIP)  
This page also redirects to the leaderboard page above  
![Updated Profile](https://drive.google.com/uc?export=view&id=1Lpfg-9Hq1-J2Fhlq9hgQtFzOtxuBunqw)

**Badges**  
Users are able to view a list of badges that they can earn  
Badges all have a ‘rarity’, describing what percentile of other users have earned it as well  
![Badges](https://drive.google.com/uc?export=view&id=1CkzzuT64XGMuoRLuK1G5CGQpya6uXWKy)

**Map**  
Map ‘fills in’ missing data using data interpolation and a heat map  
Now uses server-side rendering and formatted GeoJSON points for displays  
![Map](https://drive.google.com/uc?export=view&id=1mYwaKO0K5ZSmYbnkYnPZeWH41wR3TdbD)

*Found at /client/components or client/app*

#### Goals and/or tasks that were planned but not met/completed:

 * From most to least important.
 * For each goal/task, explain why it was not met/completed.      
   e.g. Did you change your mind, or did you just not get to it yet?

Although lots of progress was made on the map feature, the full goal was not met in accordance. The current map feature does have a slider to access dates throughout time, and does have temperature plotting and data interpolation. One of the things we didn’t focus on was scalability, specifically regarding the expansion of data interpolation on any lake in Ontario. This is hard because we have to custom make the shapes for the lakes. Instead we will just find a way to implement data points on the other lakes.

**Community Page**  
The community page gives a brief description of the aspect of monitoring our water and sustainably using its spaces  
This was not completed since we decided to focus on the map instead, this will be completed in the next sprint iteration

## Meeting Highlights

Going into the next iteration, our main insights are:

 * 2 - 4 items
 * Short (no more than one short paragraph per item)
 * High-level concepts that should guide your work for the next iteration.
 * These concepts should help you decide on where to focus your efforts.
 * Can be related to product and/or process.

**1- Prioritize High Priority Features**  
As we continue building our app, we want to ensure that we fine tune our high priority features such as the map. Currently, we only have data interpolation for the great lakes, but we need to focus on scalability and find a way to expand this to other regions as well, while improving performance and enhancing user interactivity. This includes optimizing server side processes. We need to have better prioritization as a team because we have completed a lot of P2 and P3 features but our P1 map is still a work in progress. As a result, we need to focus on the map implementation and finalize it in our next sprint iteration.

**2- Map out Feature before Implementation**  
Throughout the development process, our group often jumped into coding before fully mapping out the feature requirements and design. This led to cases where components had to be refactored or rebuilt once we migrated some Supabase-related logic to our backend. In the next iteration, we aim to take a more organized approach by outlining the scope and required user flow before starting implementation. This will reduce redundant work and prevent miscommunications between team members.
