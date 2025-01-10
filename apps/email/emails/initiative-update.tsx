import { InitiativeUpdateTemplate } from '@repo/email/templates/initiative-update';

const ExampleInitiativeUpdateEmail = () => (
  <InitiativeUpdateTemplate
    name="Jane Smith"
    title="Initiative update"
    html={`
      <h1>Project Alpha: Quarterly Update</h1>
      <p>Dear team members,</p>
      <p>I'm excited to share our progress on Project Alpha for this quarter. We've made significant strides in several key areas:</p>
      
      <h2>1. Development Milestones</h2>
      <ul>
        <li>Completed the backend infrastructure setup</li>
        <li>Launched the beta version of our mobile app</li>
        <li>Integrated third-party APIs for enhanced functionality</li>
      </ul>
      
      <h2>2. User Feedback</h2>
      <p>We've received valuable feedback from our beta testers:</p>
      <ul>
        <li>92% reported a positive user experience</li>
        <li>Key feature requests have been prioritized for the next sprint</li>
      </ul>
      
      <h3>Areas for Improvement</h3>
      <ol>
        <li>Optimize app performance on older devices</li>
        <li>Enhance the onboarding process for new users</li>
        <li>Expand language support</li>
      </ol>
      
      <h2>3. Next Steps</h2>
      <p>Moving forward, we will focus on:</p>
      <ul>
        <li>Implementing machine learning algorithms for personalized recommendations</li>
        <li>Scaling our server infrastructure to handle increased user load</li>
        <li>Preparing for the official launch in Q3</li>
      </ul>
      
      <p>Thank you all for your hard work and dedication. Let's keep the momentum going!</p>
      
      <h3>Upcoming Team Events</h3>
      <ul>
        <li>Code review session: July 15th</li>
        <li>Team building workshop: July 22nd</li>
        <li>Q&A with stakeholders: July 29th</li>
      </ul>
      
      <p>If you have any questions or suggestions, please don't hesitate to reach out.</p>
    `}
    date={new Date()}
  />
);

export default ExampleInitiativeUpdateEmail;
