import { getAllQuestionIds, getQuestionData } from '../../lib/questions';

export async function getStaticPaths() {
  const ids = await getAllQuestionIds();
  return {
    paths: ids.map((id) => ({ params: { id } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const question = await getQuestionData(params.id);
  return { props: { question } };
}

export default function QuestionPage({ question }) {
  if (!question) {
    return <div>Question not found.</div>;
  }
  return (
    <main>
      <h1>Question {question.id}</h1>
      <p>{question.prompt}</p>
      <hr />
      <p>{question.explanation}</p>
    </main>
  );
}