import express from 'express';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/labspace", (req, res) => {
  res.json({
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
    ]
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    server.close(() => {
      console.log(`Server closed due to ${signal}`);
      process.exit(0);
    });
  });
});