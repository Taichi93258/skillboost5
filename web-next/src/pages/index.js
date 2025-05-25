import Link from 'next/link';
import { getAllQuestionIds } from '../lib/questions';

export async function getStaticProps() {
  const ids = await getAllQuestionIds();
  return { props: { ids } };
}

export default function Home({ ids }) {
  return (
    <main>
      <h1>Questions</h1>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <Link href={`/questions/${id}`}>{id}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}