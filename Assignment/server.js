const fs = require("fs");

let postsCache = [];
let usersCache = [];
let lastUpdated = null;

function saveCache() {
  fs.writeFileSync(
    "cache.json",
    JSON.stringify(
      {
        posts: postsCache,
        users: usersCache,
        lastUpdated,
      },
      null,
      2
    )
  );
}

function loadCache() {
  if (fs.existsSync("cache.json")) {
    
    const data = JSON.parse(fs.readFileSync("cache.json", "utf8"));
    postsCache = data.posts || [];

    usersCache = data.users || [];

    lastUpdated = data.lastUpdated || null;
  }
}

async function safeFetch(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log("Invalid Response: " + response.status);
      return null;
    }

    const data = await response.json();

    if (!data) {
      console.log("Empty Data");
      return null;
    }
    return data;

  } catch (err) {

    console.log("Error: " + err);
    return null;
  }
}

function listPosts(limit = 10) {
  if (!postsCache.length) {
    console.log("No data available. Run: node server.js refresh");
    return;
  }

  console.log(`\nShowing ${limit} Posts:\n`);
  postsCache.slice(0, limit).forEach((p) => {
    console.log(`ID: ${p.id} | ${p.title}`);
  });
}


function filterPostsByUser(userId) {
  if (!postsCache.length) {
    console.log("No data available. Run: node server.js refresh");
    return;
  }

  const filtered = postsCache.filter((post) => post.userId == userId);

  if (filtered.length === 0) {
    console.log("No posts found for this user.");
    return;
  }

  console.log(`\nPosts for User ${userId}:\n`);
  filtered.forEach((p) => {
    console.log(`ID: ${p.id} - ${p.title}`);
  });
}



async function refreshData() {
  try {
    console.log("\n Fetching data from API ");

    const posts = await safeFetch("https://jsonplaceholder.typicode.com/posts");
    const users = await safeFetch("https://jsonplaceholder.typicode.com/users");

    if (!posts || !users) {
      console.log("Failed to fetch API data.");
      return;
    }

    postsCache = posts;
    usersCache = users;
    lastUpdated = new Date().toISOString();

    saveCache();

    console.log("Data Fetched Successfully Last Updated: " + lastUpdated);
  } catch (error) {
    console.error("Error refreshing data:", error.message);
  }
}

function getPostById(id) {
  if (postsCache.length === 0) {
    console.log("No data available.Fetch the Data By this -> Run: node server.js refresh");
    return;
  }

  const pid = parseInt(id);
  const post = postsCache.find((p) => p.id === pid);

  if (!post) {
    console.log("Post not found.");
    return;
  }

  console.log(" Post Details: \n");
  console.log(post);
}

function getUserById(id) {
  if (usersCache.length === 0) {
    console.log("No data available.Fetch the Data By this -> Run: node server.js refresh");
    return;
  }

  const uid = parseInt(id);
  const user = usersCache.find((u) => u.id === uid);

  if (!user) {
    console.log("User not found.");
    return;
  }

  console.log("\n User Details: \n");
  console.log(user);
}

async function main() {
    loadCache();
  const args = process.argv.slice(2);
  const command = args[0];
  const option = args[1];

  switch (command) {
    case "refresh":
      await refreshData();
      break;

    case "post":
      getPostById(option);
      break;

    case "user":
      getUserById(option);
      break;

    case "list-posts":     
      listPosts(option);
      break;

    case "filter-posts":   
      filterPostsByUser(option);
      break;

    default:
      console.log(`
Available Commands:

1. Fetch latest API data:
   node server.js refresh

2. Get post by ID:
   node server.js post 5

3. Get user by ID:
   node server.js user 3

4. Get List Of Posts
   node server.js list-posts 10

5. Get filter Of Post
   node server.js filter-posts 10
`);
  }
}

main();
