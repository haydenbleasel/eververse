import { Head, Hr, Html, Link, Preview, Text } from '@react-email/components';
import { EmailLayout } from './layout';

type SignupEmailTemplateProps = {
  magicLink: string;
  email: string;
  siteUrl: string;
};

export const SignupEmailTemplate = ({
  magicLink,
  email,
  siteUrl,
}: SignupEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address to get started with Eververse</Preview>
    <EmailLayout siteUrl={siteUrl}>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Thanks for signing up for Eververse! To complete your registration,
        please confirm your email address.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Click the button below to verify your email and get started with your
        account.
      </Text>
      <Link
        className="block w-full rounded-md bg-[#8b5cf6] py-2.5 text-center font-bold text-base text-white no-underline"
        href={magicLink}
      >
        Confirm Email Address
      </Link>
      <Hr className="my-5 border-[#e6ebf1]" />
      <Text className="text-left text-[#525f7f] text-base leading-6">
        This link will expire in 10 minutes. If you didn't sign up for
        Eververse, you can safely ignore this email.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        If you're having trouble with the button above, copy and paste the
        following URL into your browser:
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        <Link className="text-[#8b5cf6]" href={magicLink}>
          {magicLink}
        </Link>
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        If you have any questions or need assistance, please don't hesitate to
        reach out to our support team.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        — The Eververse Team
      </Text>
      <Hr className="my-5 border-[#e6ebf1]" />
      <Text className="text-[#8898aa] text-xs leading-4">
        This email was sent to {email}
      </Text>
    </EmailLayout>
  </Html>
);

SignupEmailTemplate.PreviewProps = {
  magicLink: 'https://app.eververse.ai/sign-up',
  email: 'test@test.com',
  siteUrl: 'www.eververse.ai',
} as SignupEmailTemplateProps;

export default SignupEmailTemplate;
