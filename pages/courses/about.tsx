import Box from '@mui/material/Box';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import Header from '../../components/layout/Header';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';
import { ABOUT_COURSES_VIEWED } from '../../constants/events';
import { logEvent } from '../../utils/logEvent';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const CourseAbout: NextPage<Props> = ({ story: storyProps, preview, sbParams, locale }) => {
  const story = useStoryblok(storyProps, preview, sbParams, locale);

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description || '',
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

  useEffect(() => {
    logEvent(ABOUT_COURSES_VIEWED);
  }, []);

  return (
    <Box>
      <Head>
        <title>{story.content.title}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection
            key={`page_section_${index}`}
            content={section.content}
            alignment={section.alignment}
            color={section.color}
          />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const sbParams = {
    version: preview ? 'draft' : 'published',
    ...(preview && { cv: Date.now() }),
    language: locale,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/about`, sbParams);
  return {
    props: {
      story: data && data?.story ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseAbout;