'use client';
import { useFormik } from 'formik';

// Lib
import { setAnswersBySlug } from '@/store/answerStorage';
import { getNextSlug, getPreviousSlug } from '@/store/slugStorage';

// Components
import QuestionFormView from './QuestionForm.view';

// Helpers
import { getValidationSchema } from './helpers/getValidationSchema';

// Senders
import { sendProgress } from '@/lib/client/peer/senders/sendProgress';

// Hooks
import { useRouter, useParams } from 'next/navigation';

// Types
import type { ContainerProps, Values } from './QuestionForm.types';

function QuestionFormContainer(props: ContainerProps) {
  const { blocks } = props;

  const { locale, slug } = useParams<{ locale: string, slug: string }>();

  const router = useRouter();

  const validationSchema = getValidationSchema(blocks);

  const nextSlug = getNextSlug(slug);
  const last = Boolean(!nextSlug);

  const formik = useFormik({
    initialValues: {},
    onSubmit,
    validationSchema,
  });

  function goBack() {
    const previousSlug = getPreviousSlug(slug);

    if (!previousSlug) return;

    router.replace(`/${locale}/questions/${previousSlug}`);
  }

  async function onSubmit(values: Values) {
    setAnswersBySlug(slug, values);

    await sendProgress({
      answer: values,
      page: slug,
    });

    if (last) {
      sessionStorage.setItem('finished', 'true');
      router.replace(`/${locale}/result`);
    } else {
      router.replace(`/${locale}/questions/${nextSlug}`);
    }
  }

  return (
    <QuestionFormView formik={formik} goBack={goBack} blocks={blocks} last={last} />
  );
}

export default QuestionFormContainer;
