import { Link } from "react-router-dom";

import { LightningBoltIcon } from "@radix-ui/react-icons";

import { useAgents } from "../../api/queries/getAgents/useGetAgents";
import { ADD_AGENT_PATH, CREATE_JOB_PATH } from "../../routes/name";
import { useAuth } from "../../store/auth";

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);

  const { agents } = useAgents({
    sender: auth?.shinkai_identity ?? "",
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? "",
    my_device_encryption_sk: auth?.profile_encryption_sk ?? "",
    my_device_identity_sk: auth?.profile_identity_sk ?? "",
    node_encryption_pk: auth?.node_encryption_pk ?? "",
    profile_encryption_sk: auth?.profile_encryption_sk ?? "",
    profile_identity_sk: auth?.profile_identity_sk ?? "",
  });

  return (
    <div className="flex w-full items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <svg
          className="shrink-0"
          fill="none"
          height="60"
          viewBox="0 0 60 60"
          width="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0C46.5685 0 60 13.4315 60 30ZM49.2164 26.0225L49.2164 26.0224C47.8058 24.6988 46.1394 23.6777 44.3197 23.0218C42.4999 22.3658 40.5652 22.089 38.6345 22.2082C36.7038 22.3274 34.8179 22.8402 33.0927 23.7151C31.6853 24.4288 30.409 25.3711 29.315 26.5015C28.9051 26.925 28.9696 27.601 29.4227 27.978L33.4437 31.3228C33.4912 31.3623 33.5354 31.4058 33.5746 31.4536C34.1364 32.1399 34.5203 32.9562 34.6898 33.8298C34.8776 34.7979 34.795 35.799 34.451 36.7231C34.1069 37.6472 33.5149 38.4587 32.7398 39.0682C32.2457 39.4568 31.6895 39.7537 31.0976 39.9482C30.5376 40.1321 30.1138 40.6529 30.1834 41.2382L30.7037 45.6102C30.7733 46.1954 31.3057 46.6182 31.8824 46.4965C33.6646 46.1202 35.3417 45.3386 36.7809 44.2067C38.5006 42.8543 39.8142 41.054 40.5774 39.0037C41.3407 36.9534 41.524 34.7325 41.1073 32.5848C40.9612 31.8318 40.7434 31.0981 40.4585 30.393C40.1448 29.6165 40.6882 28.7212 41.4972 28.9376L41.5179 28.9432C42.5303 29.2171 43.4761 29.6952 44.2969 30.348C44.8386 30.7788 45.3184 31.2797 45.7243 31.8363C46.0716 32.3126 46.7126 32.514 47.2323 32.2359L51.0769 30.1787C51.5966 29.9007 51.7958 29.2514 51.4795 28.7541C50.8423 27.7525 50.082 26.8348 49.2164 26.0227L49.2164 26.0225ZM10.9594 34.7566L10.9594 34.7564L10.9594 34.7562C10.0755 33.9638 9.29446 33.0634 8.63467 32.0763C8.30715 31.5863 8.4916 30.9327 9.00483 30.643L12.8018 28.4992C13.3151 28.2094 13.9605 28.3962 14.3185 28.8645C14.7369 29.4118 15.2279 29.9017 15.7792 30.3201C16.6147 30.9541 17.571 31.4106 18.5894 31.6615L18.6094 31.6664C19.4231 31.8646 19.9461 30.9572 19.6149 30.188C19.3143 29.4898 19.08 28.7615 18.917 28.0123C18.4517 25.8746 18.5847 23.65 19.3013 21.583C20.0178 19.5159 21.2903 17.6864 22.9788 16.2953C24.392 15.1311 26.0509 14.3117 27.8242 13.8951C28.398 13.7603 28.9398 14.1709 29.0227 14.7544L29.6419 19.1135C29.7248 19.6971 29.3129 20.2274 28.7572 20.4239C28.1698 20.6317 27.6205 20.9412 27.1354 21.3408C26.3744 21.9678 25.8008 22.7925 25.4778 23.7242C25.1549 24.6559 25.0949 25.6586 25.3046 26.6221C25.4936 27.4903 25.8949 28.2965 26.4707 28.9693C26.511 29.0164 26.5564 29.059 26.605 29.0976L30.7037 32.3528C31.1652 32.7194 31.2451 33.3938 30.8449 33.8265C29.7767 34.9813 28.5222 35.9524 27.1313 36.6978C25.4263 37.6115 23.5525 38.1669 21.625 38.3299C19.6975 38.4929 17.7571 38.2599 15.9229 37.6454C14.0888 37.0309 12.3997 36.0478 10.9594 34.7566Z"
            fill="white"
            fillRule="evenodd"
          />
        </svg>

        <h1 className="text-2xl font-bold text-foreground">Ask Shinkai AI</h1>
        <p className="text-sm text-muted-foreground">
          Try “How to make a HTTP request in JavaScript” , “Give me the top 10 rock music
          in the 80s”, “Explain me how internet works”
        </p>

        <div className="mt-4">
          {agents.length === 0 ? (
            <Link
              className="flex h-9 items-center rounded-md bg-primary-600 px-6 py-2 font-medium text-white shadow transition-colors duration-150 hover:bg-primary-700 "
              to={ADD_AGENT_PATH}
            >
              <LightningBoltIcon className="mr-2" />
              <span>Add Agent</span>
            </Link>
          ) : (
            <Link
              className="flex h-9 items-center rounded-md bg-primary-600 px-6 py-2 font-medium text-white shadow transition-colors duration-150 hover:bg-primary-700 "
              to={CREATE_JOB_PATH}
            >
              <LightningBoltIcon className="mr-2" />
              <span>Create Job</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmptyMessage;
