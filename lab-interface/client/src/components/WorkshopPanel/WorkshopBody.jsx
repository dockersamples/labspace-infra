import { useActiveSection } from "../../WorkshopContext";
import ReactMarkdown from "react-markdown";

export function WorkshopBody() {
  const { activeSection } = useActiveSection();

  return (
    <div className="workshop-body p-5 pt-3 pb-3">
      <ReactMarkdown>{activeSection.content}</ReactMarkdown>

      <hr />

      <h2>🚀 Welcome to the Content!</h2>
      <p>
        This is the content of the workshop panel. You can add more details
        about the workshop here. For example, you might include instructions,
        resources, or links to additional materials.
      </p>
      <h2>🎯 What you'll learn</h2>
      <ul>
        <li>Docker fundamentals and container lifecycle</li>
        <li>Building and managing container images</li>
        <li>Working with volumes and networking</li>
        <li>Multi-container applications with Docker Compose</li>
        <li>Best practices and debugging techniques</li>
      </ul>
      <p>
        Feel free to customize this section with any information relevant to the
        workshop participants. You can also add images, videos, or other media
        to enhance the learning experience.
      </p>
      <h3>This is a h3 heading</h3>
      <p>
        Remember to keep the content engaging and informative. Use headings,
        lists, and other formatting options to make it easy to read and
        navigate.
      </p>
      <p>
        If you have any questions or need assistance, please reach out to the
        workshop organizers. We're here to help you make the most of this
        learning experience!
      </p>
      <p>Happy learning!</p>
      <p>
        <strong>Note:</strong> This is a placeholder for the workshop content.
        Replace it with your actual workshop material.
      </p>
      <p>
        You can also add links to external resources, such as documentation,
        tutorials, or community forums. This will help participants find
        additional information and support as they work through the workshop.
      </p>
      <p>
        Don't forget to encourage participants to ask questions and share their
        experiences. This will foster a collaborative learning environment and
        help everyone get the most out of the workshop.
      </p>
      <p>
        Thank you for participating in this workshop. We hope you find it
        valuable and enjoyable!
      </p>
      <p>
        <strong>Feedback:</strong> After the workshop, please take a moment to
        provide feedback. Your input is invaluable in helping us improve future
        workshops.
      </p>
    </div>
  );
}
