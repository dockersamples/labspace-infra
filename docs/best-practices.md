# Best practices

This document is intended to capture various best practices as they are discovered.



## Naming and organization conventions

### Name your repos with a `labspace-` prefix

To help with discovery and making it clear that the repo is for a Labspace, name the repo with a `labspace-*` prefix.

This applies to your code repo (whether on GitHub or elsewhere) and your published Labspace Compose file.

### Use the `.labspace` directory

In your content repo, consider placing your writeups in the `.labspace` directory to keep things organized and to reduce the clutter that might exist with lots of files/directories in the project directory.

Note: We may consider excluding the `.labspace` directory from the File Explorer in VS Code, further reducing the clutter.



## Authoring practices

### 📍 Have a clear goal in mind for your Labspace and stick to it

With Labspaces, it's easy to have one Labspace cover a lot of topics. But, it's also really easy to create lots of Labspaces.

Recognizing that many users benefit from short hands-on experiences, it's preferred to keep your Labspace focused. Don't cover too many topics.

Answer this question - **what are the one or two things a user should come away from this experience?** Then stick to that goal.


### 🎉 Make it fun!

Ensure your participants have fun during your Labspace. Feel free to use a fun story or sample application. Use creative emojis!


### 💪 Empower the student, not yourself

While Labspaces may be offered in group settings, they are completed individually. While you, the author, may be guiding them, they are doing it on their own. Therefore, empower them!

Avoid the usage of first-person plural terms, such as "we", "us", "let's", "our".

- **Instead of...** Now that we have a Dockerfile, we are ready to build our first container image!
- **Consider...** Now that you have a Dockerfile, you are ready to build your first container image!



### 🔐 Package everything directly into the Labspace

Labspaces should be able to run completely independently of the user's local machine. Users should only need a container runtime installed. 

There should be no bind mounts from the host or other interaction with the host machine. While there are various protections in place, they can also be removed through various configuration overrides. Don't do this as it reduces the amount of trust students may have in your content.