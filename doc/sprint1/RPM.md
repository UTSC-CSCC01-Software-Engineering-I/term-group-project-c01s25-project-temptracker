**Release Plan**

### **Release Name:** \<tempTracker-release1\>

### **Release Objectives**

Detail the primary goals for the sprint N release. Each objective should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).

- The primary goal of Sprint 1 is to establish the foundation for the tempTracker application, which includes setting up the environment for the project (backend and frontend) and completing the basic user features that the team has agreed on

#### **Specific Goals**

* Clearly state the specific goals for the release.  
* Ensure they are well-defined and understood by the course team

1. Project setup:   
   1. setup the github repository, directory structure, and initial environment configuration files.  
   2. Ensure all team members can clone, build, and run the project locally.  
2. Supabase Configuration:   
   1. Configure Supabase for authentication: implement user registration, login, and password reset functionality.  
   2. Set up the Supabase database schema to store temperature data, including fields for user ID, timestamp, temperature (C/F), and geolocation.  
3. Main Home Page (frontend):  
   1.  Build the main Home page and a reusable Navbar component.  
   2. Ensure basic navigation between Home, Login, and Register pages works as intended.  
4. Connect Map Api:   
   1. Integrate a map service (Leaflet) that allows input of coordinates.  
   2. Display markers on the map at user-specified locations.  
5. Colour coded map:  
   1. Implement temperature-based color-coding for map markers (blue for cold, red for hot).  
   2. Ensure markers are dynamically styled based on the submitted temperature data.

#### **Metrics for Measurement**

* Identify metrics or KPIs that will measure the success of each objective.  
* Make sure these metrics are quantifiable and trackable.

1. Project Setup:  
   1. Github repo is initialized with proper structure (client, server)  
   2. All team members have cloned and ran the app locally  
   3. Team has setup local env  
2. Supabase  
   1. Register, login and forget password are functional with a 100% success rate  
   2. User is redirected to home page after login  
   3. Supabase auth session exists after login  
3. Supabase DB schema  
   1. Database has a user temperature input data with userid,temperature, unit, latitude, longitude  
   2. Data from user upload successfully uploads 99% of the time, otherwise it gives proper error code  
   3. Manual DB tests confirm the schema is correct and functional  
4. Home page/navbar  
   1. Home page (with map) properly loads up on local environment\\  
   2. Navbar successfully links routes to home, login, register, user upload  
   3. Navbar is consistent across all pages  
5. Connect Map api  
   1. Map component loads correctly and pinpoints user location using their current location  
   2. 99% success rate for manual coordinate input tests and map updates, otherwise proper error message is given  
6. Colour coded map  
   1. Markers on the map change colour according to temperature scale using an api of our choice  
   2. 99% of colour coded cases will show correct marker colour based on input in the location  
   3. Legend to clarify the colour coding to the user

   

### **Release Scope**

Outline what is included in and excluded from the release, detailing key features or improvements, bug fixes, non-functional requirements, etc.

#### **Included Features**

* List all key features and improvements included in the release.  
* Provide a brief description and purpose of each.

1. Authentication system:  
   1. Included a register system using supabase authentication where user has to confirm password, then user can login to their account using credentials  
   2. Purpose: This is used so that the user can input their temperature data (only logged in users can)  
   3. Forget password and logout system is included if user forgets password or wants to logout  
2. User input upload  
   1. Users can upload a csv/json of their data which is then stored into the supabase database  
   2. The purpose is so that the users data is then used to populate the map with the corresponding colour to determine the temperature of the water  
3. Navbar  
   1. A bar on top of the page that route to various pages like home, user upload, login, register  
   2. Purpose: makes it easy for user to navigate to different pages  
4. Connect map api  
   1. Implemented leaflet api to our home page and allowed searching with latitude, longitude  
   2. Purpose: allow users to efficiently locate the body of water on the map and check the temps  
5. Colour coded map  
   1. Implemented colour coding on the lake to reflect the user input temperature data, blue is for cold and red is for hot, and there are colour ranges in between  
   2. Purpose: to allow users to look at map and legend and instantly figure out the temperature

#### **Excluded Features**

* Identify any features or changes not included in the release.  
* Explain the reasoning behind these exclusions.

1. A feature that we excluded was the admin specific page that would show us the user data from temp inputs  
   1. This exclusion was because we are not testing on that big of a scale yet that we would need this feature  
2. Another thing that was left out is the profile icon linking to the login and register  
   1. The reasoning is that right now it is on the navbar and we have no reason to move it since we are going to focus on ui touchups in the next sprint

#### **Bug Fixes**

* List major bug fixes included in the release.  
* Prioritize them based on impact and urgency.\\

1. One major bug fix is the styling fix for all our pages, such as user input, login, register, forget password  
   1. This was high priority for us because the ui for all the forms were very different and looked out of place so we had to make a universal style  
2. Another bug fix was the navbar on a mobile phone. The problem was that the navbar would cutoff the authentication stuff on certain mobile apps  
   1. This was the highest priority for us and we needed to make sure mobile users could login. This was very urgent

#### **Non-Functional Requirements**

* Detail any performance, security, or usability requirements.  
* Ensure these are measurable and testable.

1. Performance:  
   1. The map (including colour coding), user input data, login, register and all other pages should load in \<2 seconds  
   2. Performance should be same on all device types  
   3. We check this by doing a manual test  
2. Security:  
   1. Only authenticated users with a valid session can access the temperature uploads and map input functionalities  
   2. We want to ensure that unauthorized access gets redirected to login and that we have no unauthorized data being input  
3. Usability  
   1. The interface must be useable on all devices and specifically on mobile devices like iPhones and Samsung  
   2. Proper sizing of components should be ensured  
   3. Ensure this by manually testing on phone  
   4. Data upload must succeed 99% of the time to ensure that we have valid data colour coded on the map

#### **Dependencies and Limitations**

* Outline any external dependencies that might affect the release.  
* Identify any known limitations of the current release

1. We don't have a user dashboard yet for admins so we can only check our input directly on supabase  
2. Our site isn't actually hosted, thus we can only use browser tools to check mobile implementation  
3. We are using Supabase, Leaflet, Next.js, geolocation, sonner dependencies that are all included in our release  
4. There may be performance issue on mobile devices that we still have to wokr on

In an Organizational setting, the Release Planning Document also has additional details. For Term Project, groups can ignore the below sections but give thoughts on how would you complete the below sections if you were responsible for filling them out.

* ### **Detailed Instruction \- Steps to Carry Out the Deployment**

We would ensure all changes are merged to main in github  
Make sure all .env variable are properly hidden (included in readme)  
Test the app locally before deployment  
Then deploy the app using hosting service

* **PIV (Post Implementation Verification) Instruction**

We can test with and without using an admin account to ensure authentication and user input is working correctly  
Test navbar and maps  
We can check supabase to ensure all data is being written properly  
Test the colour coded aspect of map  
Logout to ensure that session working properly and protecting certain pages

* **Post Deployment Monitoring**

Monitor supabase for any errors  
Setup alerts whenever the build fails  
Have a feedback form on the app that lets users submit feedback to us

* **Roll Back Strategy**

Revert to a previous build on main and try to hotfix the current build to fix the issue

Make sure to notify users that the app is down

