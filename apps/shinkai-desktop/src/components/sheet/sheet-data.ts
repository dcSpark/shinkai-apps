import {
  FormattedRow,
  Rows,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';

export const generateRowsData = (rows: Rows, display_rows: string[]) => {
  return display_rows.map((rowId) => {
    const columns = rows[rowId];
    const formattedRow: FormattedRow = {
      rowId,
      fields: {},
    };

    Object.entries(columns).forEach(([columnId, columnData]) => {
      formattedRow.fields[columnId] = {
        ...columnData,
        columnId,
        rowId,
      };
    });

    return formattedRow;
  });
};

export const topProductivityBooks = [
  {
    title: 'Getting Things Done: The Art of Stress-Free Productivity',
    author: 'David Allen',
    yearReleased: 2001,
    pages: 267,
    genre: 'Business/Self-Help',
    summary:
      "Allen's work-life management system teaches how to transform overwhelming tasks into an efficient workflow, leading to increased productivity and reduced stress.",
  },
  {
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    yearReleased: 2016,
    pages: 304,
    genre: 'Business/Psychology',
    summary:
      'Newport argues that the ability to focus without distraction is becoming increasingly valuable. He outlines strategies to train your mind and transform your work habits.',
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen Covey',
    yearReleased: 1989,
    pages: 381,
    genre: 'Self-Help/Business',
    summary:
      'Covey presents a holistic, principle-centered approach for solving personal and professional problems, focusing on fairness, integrity, and human dignity.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    yearReleased: 2018,
    pages: 320,
    genre: 'Self-Help/Psychology',
    summary:
      'Clear provides practical strategies for forming good habits, breaking bad ones, and mastering the tiny behaviors that lead to remarkable results.',
  },
  {
    title: 'The One Thing',
    author: 'Gary Keller and Jay Papasan',
    yearReleased: 2013,
    pages: 240,
    genre: 'Business/Self-Help',
    summary:
      'The authors propose that focusing on one thing at a time is the key to remarkable results in every area of life, from work to personal relationships.',
  },
  {
    title: 'Essentialism: The Disciplined Pursuit of Less',
    author: 'Greg McKeown',
    yearReleased: 2014,
    pages: 272,
    genre: 'Business/Self-Help',
    summary:
      'McKeown challenges the idea that we can do it all and instead advocates for pursuing only what is essential, leading to greater productivity and satisfaction.',
  },
  {
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    yearReleased: 2012,
    pages: 375,
    genre: 'Psychology/Self-Help',
    summary:
      'Duhigg explores the science behind habit creation and reformation, providing insight into how habits work and how they can be changed.',
  },
  {
    title: 'Eat That Frog!',
    author: 'Brian Tracy',
    yearReleased: 2001,
    pages: 128,
    genre: 'Business/Self-Help',
    summary:
      'Tracy offers 21 practical and doable steps to stop procrastinating and get more done in less time, focusing on tackling the most challenging tasks first.',
  },
  {
    title: 'The 4-Hour Work Week',
    author: 'Timothy Ferriss',
    yearReleased: 2007,
    pages: 308,
    genre: 'Business/Lifestyle',
    summary:
      'Ferriss shares unconventional strategies for escaping the 9-5 grind, living more and working less through outsourcing, automation, and lifestyle design.',
  },
  {
    title: 'Make Time: How to Focus on What Matters Every Day',
    author: 'Jake Knapp and John Zeratsky',
    yearReleased: 2018,
    pages: 304,
    genre: 'Self-Help/Time Management',
    summary:
      'The authors present a framework for designing your day to make time for the things that matter, offering tactics to beat distraction and create focus.',
  },
  {
    title: 'The Productivity Project',
    author: 'Chris Bailey',
    yearReleased: 2016,
    pages: 304,
    genre: 'Self-Help/Productivity',
    summary:
      'Bailey shares the results of his year-long productivity experiment, offering insights and tactics to work smarter and live better.',
  },
  {
    title: '168 Hours: You Have More Time Than You Think',
    author: 'Laura Vanderkam',
    yearReleased: 2010,
    pages: 272,
    genre: 'Time Management/Self-Help',
    summary:
      'Vanderkam challenges the traditional notion of time management, encouraging readers to examine how they spend their hours and make deliberate choices.',
  },
  {
    title: 'The Checklist Manifesto',
    author: 'Atul Gawande',
    yearReleased: 2009,
    pages: 208,
    genre: 'Business/Productivity',
    summary:
      'Gawande explores how the simple tool of checklists can bring about striking improvements in various fields, from medicine to aviation.',
  },
  {
    title: 'Mindset: The New Psychology of Success',
    author: 'Carol S. Dweck',
    yearReleased: 2006,
    pages: 276,
    genre: 'Psychology/Self-Help',
    summary:
      'Dweck introduces the concept of growth mindset versus fixed mindset, showing how our beliefs about our capabilities influence our success and productivity.',
  },
  {
    title: 'The Now Habit',
    author: 'Neil Fiore',
    yearReleased: 1988,
    pages: 224,
    genre: 'Self-Help/Psychology',
    summary:
      'Fiore presents strategies to overcome procrastination and achieve guilt-free play, offering a comprehensive program for increasing productivity.',
  },
  {
    title: 'Flow: The Psychology of Optimal Experience',
    author: 'Mihaly Csikszentmihalyi',
    yearReleased: 1990,
    pages: 303,
    genre: 'Psychology/Self-Help',
    summary:
      "Csikszentmihalyi explores the concept of 'flow' - a state of heightened focus and immersion in activities - and its role in creativity and happiness.",
  },
  {
    title: 'Hyperfocus',
    author: 'Chris Bailey',
    yearReleased: 2018,
    pages: 256,
    genre: 'Self-Help/Productivity',
    summary:
      'Bailey delves into the science of attention, offering practical strategies to manage your attention and increase productivity in a distracted world.',
  },
  {
    title: 'The Effective Executive',
    author: 'Peter F. Drucker',
    yearReleased: 1966,
    pages: 208,
    genre: 'Business/Management',
    summary:
      "Drucker identifies five practices essential to business effectiveness that can, and must, be learned, focusing on managing oneself and one's responsibilities.",
  },
  {
    title: 'Smarter Faster Better',
    author: 'Charles Duhigg',
    yearReleased: 2016,
    pages: 400,
    genre: 'Business/Psychology',
    summary:
      'Duhigg explores the science of productivity, explaining why some people and companies are so much more productive than others.',
  },
  {
    title: 'The Bullet Journal Method',
    author: 'Ryder Carroll',
    yearReleased: 2018,
    pages: 320,
    genre: 'Self-Help/Productivity',
    summary:
      'Carroll introduces the Bullet Journal method, a mindfulness practice disguised as a productivity system, helping to organize thoughts and achieve goals.',
  },
];
