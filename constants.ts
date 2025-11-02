import type { Topic } from './types';

export const COURSE_STRUCTURE: Topic[] = [
  {
    title: 'Google AI Studio',
    subtopics: [
      {
        title: 'Introduction',
        chapters: [
          { title: 'What is Google AI Studio?' },
          { title: 'Key Features and Capabilities' },
          { title: 'Setting Up Your First Project' },
        ],
      },
      {
        title: 'Advanced Techniques',
        chapters: [
          { title: 'Working with Different Models' },
          { title: 'Fine-Tuning Models' },
          { title: 'Integrating with APIs' },
        ],
      },
    ],
  },
  {
    title: 'Cybersecurity',
    subtopics: [
      {
        title: 'Fundamentals',
        chapters: [
          { title: 'Core Principles of Cybersecurity' },
          { title: 'Common Threats and Vulnerabilities' },
          { title: 'Introduction to Cryptography' },
        ],
      },
      {
        title: 'Defensive Security',
        chapters: [
          { title: 'Firewalls and Network Security' },
          { title: 'Intrusion Detection Systems' },
          { title: 'Security Information and Event Management (SIEM)' },
        ],
      },
    ],
  },
  {
    title: 'Ethical Hacking',
    subtopics: [
      {
        title: 'Getting Started',
        chapters: [
          { title: 'The Ethics of Hacking' },
          { title: 'Phases of a Penetration Test' },
          { title: 'Setting Up a Hacking Lab' },
        ],
      },
      {
        title: 'Practical Skills',
        chapters: [
          { title: 'Reconnaissance and Footprinting' },
          { title: 'Scanning and Enumeration' },
          { title: 'Exploitation and Post-Exploitation' },
        ],
      },
    ],
  },
  {
    title: 'Data Engineering',
    subtopics: [
      {
        title: 'Core Concepts',
        chapters: [
          { title: 'The Role of a Data Engineer' },
          { title: 'Data Warehousing vs. Data Lakes' },
          { title: 'ETL vs. ELT Pipelines' },
        ],
      },
      {
        title: 'Tools of the Trade',
        chapters: [
          { title: 'Introduction to Apache Spark' },
          { title: 'Working with Cloud Data Platforms (GCP, AWS, Azure)' },
          { title: 'Data Orchestration with Airflow' },
        ],
      },
    ],
  },
  {
    title: 'Prompt Engineering',
    subtopics: [
      {
        title: 'The Basics',
        chapters: [
          { title: 'What is Prompt Engineering?' },
          { title: 'Anatomy of a Good Prompt' },
          { title: 'Zero-shot vs. Few-shot Prompting' },
        ],
      },
      {
        title: 'Advanced Strategies',
        chapters: [
          { title: 'Chain-of-Thought Prompting' },
          { title: 'Structured Output and JSON Mode' },
          { title: 'Building Agentic Systems with Prompts' },
        ],
      },
    ],
  },
  {
    title: 'Variables in Programming',
    subtopics: [
      {
        title: 'Introduction to Variables',
        chapters: [
          { title: 'What is a Variable?' },
          { title: 'Declaring and Initializing Variables' },
          { title: 'Common Data Types (Strings, Numbers, Booleans)' },
          { title: 'Constants vs. Variables' },
        ],
      },
      {
        title: 'Scope and Lifetime',
        chapters: [
          { title: 'Understanding Scope (Global vs. Local)' },
          { title: 'Block Scope with let and const' },
          { title: 'Variable Hoisting Explained' },
        ],
      },
    ],
  },
];
