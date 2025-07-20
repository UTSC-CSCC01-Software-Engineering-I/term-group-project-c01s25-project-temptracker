# **Release Plan**

### **Release Name:** <Release-v3.0>

---

### **Release Objectives**

Detail the primary goals for the sprint N release. Each objective should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).

- For the third release of TempTracker’s GLOW, we want to build and release the newly updated map component, allowing a smooth, continuous mapping system that allows users to visualize temperature. After the last sprint, our group realized that our current client-side map implementation was too computationally complex, and the map could take up to 5 seconds to load or crash on less powerful devices. We aim to achieve a map load time of less than 1 second while transitioning to a partially server-side map rendering. The map should be populated with around 500k test points in order to test the long term scalability of our implementation.

- The second primary goal is to implement many of the ‘gamification’ features in order to increase the community aesthetic of our app. By the end of the release, we plan to have a fully created community page that displays several metrics, including a large global leaderboard ranking users by their streak, number of uploads, and more. Since our app has fully integrated login functionality, we are able to differentiate users and encourage them to compete with one another to increase their datasets while encouraging users to align with our mission.

---

#### **Specific Goals**

- Create a community page that redirects to two supbages:
  - A scaled-down version of a photo upload system. Users will be able to tag photo uploads with a specific ‘Point of Interest’ (a notable beach, or scenic point) and can like each other’s pictures. Depending on time constraints, we could add captions, and a recommender algorithm to show most liked pictures within a given time.
- Add a list of badges to the users’ profile section. These badges will also increase the gamification and community experience. This list of badges will include trivial to mildly complex tasks (based on number of max streak, photo uploads, places visited, etc).
- Create an interactive map that uses colour-coded displays to showcase temperature data, including extra utilities such as unit conversion, time sliders, and accessibility shortcuts. This implementation will have a server-side component to reduce client-side latency.
- Finish quality of life enhancements to the MVP flow. This includes allowing the device to prompt for current location when uploading data, allowing data exports, and adding a settings page.

---

#### **Metrics for Measurement**

- **Community Page**  
  - The community page should have a button that links to a separate frontend route (maybe community/leaderboard) that hosts the leaderboard. This route fetches from a service class that queries PostgreSQL and displays the top 50 users for each rank (likes, streak, upload). This route should have less than 500ms latency and have low error rates.

- **Badges**  
  - Design and implement a set of badges to be awarded. We can create triggers/hooks that listen for certain activity and populate the badges table to ensure they are up-to-date.

- **Interactive Map Temperature**  
  - The map should have low latency and load within a reasonable <1000ms on the client. The map should aggregate data from our temperatures table and use some server-side caching or rendering to reduce the latency.

- **QOL Improvements**  
  - On the upload temperature screen, we should prompt users to use their location and set their coordinates to their current location if they choose to.  
  - Settings page, data exports, and extra utilities should be consistent across mobile and web browsers. Aim to achieve a fully responsive design.

---

### **Release Scope**

The v3.0 release of the GLOW app should fulfill the primary goals outlined above, with some changes in implementation and construction.

---

#### **Included Features**

- **Community Page**  
  - The community page gives a brief description of the aspect of monitoring our water and sustainably using its spaces. After that, it redirects to a leaderboard and a photo gallery.

- **Leaderboard**  
  - The leaderboard is a table of the top 30 users with the most temperature uploads, likes on posts (WIP), and max streak. The data is queried from the DB and filters above the frontend table let us toggle between ranking based on the different metrics.

- **Updated Profile**  
  - The profile page also summarizes a user’s stats, including their streak and place on the global ranking. It also displays their earned badges (WIP).  
  - This page also redirects to the leaderboard page above.

- **Photo Gallery (WIP)**  
  - The photo gallery will allow users to upload photos tagged with a list of popular destination spots/points of interest. Currently, the UI has been completed, but the backend will later only show a subset of most popular/latest images. We will also limit user uploads and scale later if necessary.

- **Badges (WIP)**  
  - Users are able to view a list of badges that they can earn.  
  - Badges all have a ‘rarity’, describing what percentile of other users have earned it as well.

- **Map (WIP)**  
  - Map ‘fills in’ missing data using data interpolation and a heat map.  
  - Now uses server-side rendering and formatted GeoJSON points for displays.

---

#### **Excluded Features**

- **Timeline/Archive Map View**  
  - Adding a slider to the map involves numerous utilities that will be heavily prioritized in the final release. We will also add functionality to poll data from a specific date and compare average data from either the entire lake or a specific point to the current day.

- **Photo Upload**  
  - Although the photo gallery frontend has been established, a dedicated backend to upload photos and store them in a Supabase bucket has not been established. This will be carried out in Sprint 4.

- **Ideas for extension (including air quality, weather)**  
  - These ideas are not part of the MVP, and will be judged based on time constraints and the progress of future iterations.

---

#### **Bug Fixes**

- Using OAuth to log in now correctly prompts the user to create a username.  
- Updated RLS policies to properly allow specific users to update/read rows, while admin accounts to have extended privileges.

---

### **Non-Functional Requirements**

- **Performance**  
  - All pages should load under 2 seconds.  
  - Our map should either render 500k points server-side or use some rasterization/tiling to limit computation on the browser.  
  - Temperature uploads (including bulk CSV) have to be uploaded and reflected in the map data in <2 seconds.

- **Security**  
  - All uploaded data (photos, temperatures) need to be rate-limited and verified for correctness.  
    - Admins should have the ability to report this data.  
  - RLS Policies ensure that only admins can see all user tables while users are restricted to their own data.  
  - Block some pages of the website before creating an account. Ex: leaderboard and profile routes should be blocked by middleware until account creation.

- **Usability**  
  - The entire webpage should be responsive regardless of device size.  
  - All icons and buttons are optimized for web-based mobile access.  
  - Users should be able to understand the different leaderboards and badges. This means having descriptive descriptions of how to achieve them and how they are measured.

---

### **Dependencies and Limitations**

- Currently don’t have a fully developed/integrated CI/CD pipeline. Without hosting, we cannot fully test on a mobile device.  
- We are limited to backend hosting and photo uploads by technology. We don’t have access to large S3 buckets for AWS cloud storage, so must work with reasonable tools.  
- Displaying the map server-side is extremely computationally exhaustive. We need to find a solution that does not require vertical scaling.

---

### **Detailed Instruction - Steps to Carry Out the Deployment**

- We would ensure all changes are merged to the main branch in GitHub.  
- With proper unit tests now, we will use GitHub actions to verify tests before pushing code to either the develop/main branch.  
- Make sure all .env variables are properly hidden (included in the readme).  
- Start both backend and frontend in their respective directories.

---

### **PIV (Post Implementation Verification) Instruction**

We can test with and without using an admin account to ensure that authentication and user input are working correctly.

- Ensure load testing for the map and ensure latency using the server-side map implementation.  
- Check Supabase to ensure all DB writes/reads are succeeding.  
- Automate unit tests (create a script for this) to ensure app functions correctly.  
- Ensure rendered points are appearing on the map.  
- Test login/registration flow, including sign-in, register, logout, OAuth to ensure that session is working properly and protecting certain pages.

---

### **Post-Deployment Monitoring**

- Monitor Supabase for any read/write errors.  
- Set up alerts whenever the build fails.  
- Have a feedback form on the app that lets users submit feedback to us.

---

### **Roll Back Strategy**

- Revert to a previous build on main and try to hotfix the current build to fix the issue.  
- Use PostgreSQL data backups in case of dropped tables.  
- Make sure to notify users that the app is down.
