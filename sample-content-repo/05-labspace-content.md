# 🔨 Labspace Content

Now that you've got an idea of what a Labspace _is_ technically, it's important to take a moment and talk about the content side of things.

## 🔑 Key concepts

- The metadata and configuration for a Labspace is defined in a `labspace.yaml` file
- Each page of content is called a **section**. Each section is written in Markdown.
- The Labspace content is packaged as a standalone Git repository and cloned during the Labspace bootstrapping
- The Labspace content repo can also include additional sample app code, starting materials, or other resources


## The `labspace.yaml` file

The `labspace.yaml` file defines the configuration for the Labspace. It **must be at the root of the repo.**

The file consists of the following items:

```yaml save-as=labspace.yaml
metadata:
  id: dockersamples/my-first-labspace # Should be the name of the published OCI artifact
  sourceRepo: github.com/dockersamples/my-first-labspace
  contentVersion: abcd123 # Usually the short commit sha
  title: Labspace title
  description: |
    The description of the Labspace, generally in 100 characters or less

sections:
  - title: Section One
    contentPath: ./path/to/section-one.md
  - title: Section Two
    contentPath: ./section-two.md
  - title: Section Three
    contentPath: ./docs/section-three.md
```

The paths for each section defined in `contentPath` are anchored at the root of the repository.


## Development

While developing a Labspace, it's helpful to spin up the Labspace in **development mode.** In dev mode, the following adjustments are made:

- The files are mounted instead of cloned, making it easier to see the changes
- The interface periodically polls for changes to the content making it faster to see the changes
