const MOCK_CONTENT_1 = `
# Welcome to the Labspace Demo!

This is a demo Labspace to demonstrate how they work! You can use this space to explore the features of Labspace, including containers, images, builds, and multi-container setups.

## Running your first container 
To get started, you can run your first container. Labspace allows you to run containers directly from the interface, making it easy to test and develop applications in isolated environments.

\`\`\`console
docker run -d -p 8080:80 nginx
\`\`\`
`;

const MOCK_CONTENT_2 = `
# Images & Builds
In this section, you'll learn about Docker images and how to build them. Docker images are the blueprints for your containers, and understanding how to create and manage them is crucial for effective containerization.
## Building a Docker Image
To build a Docker image, you can use the following command:
\`\`\`console
docker build -t my-image:latest .
\`\`\`
`;

export class WorkshopStore {
  async bootstrap() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  getWorkshopDetails() {
    return {
      title: "Demo Labspace",
      subtitle: "This is a demo Labspace to demonstrate how they work!",
      sections: [
        {
          id: "getting-started",
          title: "Getting Started",
        },
        {
          id: "containers",
          title: "Containers",
        },
        {
          id: "images-builds",
          title: "Images & Builds",
        },
        {
          id: "multi-container",
          title: "Multi-Container",
        },
        {
          id: "advanced",
          title: "Advanced Builds",
        },
      ],
    };
  }

  getSectionDetails(sectionId) {
    const section = this.getWorkshopDetails().sections.find(
      (section) => section.id === sectionId,
    );
    if (!section) {
      return null;
    }

    return {
      ...section,
      content:
        Math.round(Math.random()) === 0 ? MOCK_CONTENT_1 : MOCK_CONTENT_2,
    };
  }
}
