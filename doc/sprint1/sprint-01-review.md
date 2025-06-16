\# YOUR PRODUCT/TEAM NAME tempTracker

 \> \_Note:\_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.        
 \>        
 \> \_Suggestion:\_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.

\#\# Iteration XX \- Review & Retrospect

 \* When: June 14, 2025  
 \* Where: Online

\#\# Process \- Reflection

Short introduction

This sprint marked a significant progress in the development of “GLOW.” The team successfully implemented core features, including user authentication, the temperature upload form, and interactive map integration. Leveraging Next.js, Supabase, and Shadcn components, the primary focus was to deliver the essentials for a positive user experience through modern design. Each feature was thoughtfully designed to align with our project goals, laying a strong foundation for future iterations.

\#\#\#\# Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

1. We decided to focus on making our project scalable by having a proper hierarchy for our project. We did this by separating client, server folders and properly organizing all the data in them so the team can know where everything is. This was successful because it has made us more productive so that now we can complete our project faster. If you look in our github hierarchy you will see client and server, and inside those files you will see more directories like in client we have components and apps which contain frontend reusable components and main pages.  
2. Worked on the basic things like navbar and main webpage before doing anything. This was also very important because we were confused on where to start at the beginning, but we decided to start with the basics and then build off of it, allowing us to be more efficient (look at headers.tsx and page.tsx) these files were the base of out project  
3. Used github project to specify tasks to do, in progress, completed was a good idea because it allowed the team to be more organized by following specific tasks for feature implementation. (can be found in our github repository/projects)

 \* 2 \- 4 decisions.  
 \* Ordered from most to least important.  
 \* Explain why (i.e. give a supporting argument) you consider a decision to be successful.  
 \* Feel free to refer/link to process artifact(s).

\#\#\#\# Decisions that did not turn out as well as we hoped

List process-related (i.e. team organization) decisions that, in retrospect, were not as successful as you thought they would be.

1. An unsuccessful decision was to try to directly implement the user stories, because they were not really task focused and caused confusion, causing us to switch to more feature oriented tasks on github projects. You can check the jira and see that there most of the user stories are a bit vague and harder to understand, then look at our github repo projects section in sprint 1 and see the difference  
2. Another decision that was not as successful was the usage of basic templates from supabase, if you look at the initial commit you will see very convoluted sub directories especially for the client side there were lots of useless components that we decided to redesign especially the login and signup templates. So, we ended up deciding to remove them and replace them with ones that we made from scratch

 \* 2 \- 4 decisions.  
 \* Ordered from most to least important.  
 \* Feel free to refer/link to process artifact(s).

\#\#\#\# Planned changes

List any process-related changes you are planning to make (if there are any)

 \* Ordered from most to least important.  
 \* Explain why you are making a change.

1. The only process related change we made was to start using github projects which was very helpful for the organization of the tasks. We are making this change because it was confusing for the team to keep track of tasks

\#\# Product \- Review

\#\#\#\# Goals and/or tasks that were met/completed:

 \* From most to least important.  
 \* Refer/link to artifact(s) that show that a goal/task was met/completed.  
 \* If a goal/task was not part of the original iteration plan, please mention it.

1. Construction of the navbar (located at Header.tsx and implemented in page.tsx), this navbar has buttons to navigate to different pages on our website  
2. Design and setup authentication (under app/register and app/register and buttons implement in Header.tsx along with logout). We have login and register buttons on navbar which disappear when logged in and are replaced with logout. We also have password recovery just in case user forgets password  
3. Connect temp upload to supabase and create database schema for user temperature input (can be found on the supabase dashboard) and in the client/app/upload where you can find the upload form  
4. Connected map api to the project (can check geolocation.tsx in client/components), this added the map to the home page along with a search latitude/longitude   
5. Add map options for colour-coded data based on the temperature. Data Points on the map create a coloured area around them according to a gradient scale and allow users to interact to see the current temperature. Also includes a legend explaining the scale.  
6. Setup directories to make a scalable base for the project, we separated client and server and made subdirectories to make it easy to scale the project

\#\#\#\# Goals and/or tasks that were planned but not met/completed:

1. Admin only input check, this feature is not completed yet because it is low priority and we don’t need this until we start full testing our app

 \* From most to least important.  
 \* For each goal/task, explain why it was not met/completed.        
   e.g. Did you change your mind, or did you just not get to it yet?

\#\# Meeting Highlights

Going into the next iteration, our main insights are:

 \* 2 \- 4 items  
 \* Short (no more than one short paragraph per item)  
 \* High-level concepts that should guide your work for the next iteration.  
 \* These concepts should help you decide on where to focus your efforts.  
 \* Can be related to product and/or process.

1. Over to the next iteration one our main items that we will work on is the gamification implementation. Our idea is to give user points, badges, or streak tracking to increase user engagement. This will help make the app more interactive and motivate users to contribute temperature data regularly. This is definitely an extra feature and will be a good addition to our app  
2. Another item that we will be working on is dealing with restricted pages and an admin dashboard where we can see user inputted data and can verify the accuracy of it to ensure that there are no variables in our data. Restricted pages will allow only verified users to contribute so we know who contributes to what data  
3. Now that the map API is integrated, our next goal is to improve the ui of the temperature color overlay. add more useful information for users (adding time data), and increasing interactivity