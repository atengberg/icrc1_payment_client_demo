import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useCanister from "../feature/canister-provider/useCanister";
import ThemeModeWidget from "./ThemeModeWidget";
import LoginoutWidget from "./LoginoutWidget";
import {
  RiFileCopyFill, 
  RiDeleteBin7Fill, 
  RiAddCircleFill, 
  RiHomeFill,
  GameIconsTakeMyMoney,
  IonListCircle,
  RiBug2Fill,
  RiBug2Line,
  GrommetIconsGithub
} from "./Icons";
import { statusEnum, pagesEnum } from "../utils/enums";

const Header = () => {

  const { isAuthenticated } = useCanister();
  const { pathname } = useLocation();
  const [currentPage, setCurrentPage] = useState(pagesEnum.LANDING);

  useEffect(() => {
    if (isAuthenticated) {
      if (pathname === '/payments') {
        setCurrentPage(() => pagesEnum.PAYMENTS);
      } else if (pathname === "/payments/create") {
        setCurrentPage(() => pagesEnum.SEND);
      } else if (/^(\/payments\/p\/)(?:(?!.*--)(?!.*-$)[A-Za-z0-9-]){1,}$/.test(pathname)) {
        setCurrentPage(() => pagesEnum.DETAILS);
      } else {
        setCurrentPage(() => pagesEnum.HOME);
      }
    } else {
      setCurrentPage(() => pagesEnum.LANDING)
    }
  }, [isAuthenticated, pathname])

  switch (currentPage) {
    case pagesEnum.HOME:
      document.title = "Home - ICRC1 Payment Client Demo";
      break;
    case pagesEnum.PAYMENTS:
      document.title =  "Payments List - ICRC1 Payment Client Demo";
      break;
    case pagesEnum.DETAILS:
      document.title =  "Payment Details - ICRC1 Payment Client Demo";
      break;
    case pagesEnum.SEND:
      document.title =  "Send Payment - ICRC1 Payment Client Demo";
      break;
    default:
    case pagesEnum.LANDING:
      document.title =  "ICRC1 Payment Client Demo";
      break;
  };

  function getPageControls(page) {
    switch (page) {
      case pagesEnum.LANDING:
        return null;
      case pagesEnum.HOME:
        return (
          <>
          <SendPaymentWidget />
          <PaymentsListWidget />
          </>
        );
      case pagesEnum.PAYMENTS:
        return (
          <>
          <SendPaymentWidget />
          <HomeWidget />
          </>
        );
      case pagesEnum.DETAILS: {
        const id = pathname.replace('/payments/p/', '');
        return (
          <>
          <CopyPaymentToSendWidget id={id} />
          <HomeWidget />
          </>
        );
      };
      case pagesEnum.SEND:
        return (
          <>
          <PaymentsListWidget />
          <HomeWidget />
          </>
        );
    }
  };
  
  return (
    <div className="flex h-[4.25rem] items-center px-6 xl:container xl:mx-auto">
      <div className="m-s:gap-5 m-l:gap-6 m-xl:gap-7 flex h-full w-full items-center gap-4 sm:gap-8 md:gap-10 lg:gap-12">
        <BrandLogoWidget />
        <div className="flex-1"></div>
        {getPageControls(currentPage)}
        <ThemeModeWidget />
        <LoginoutWidget />
      </div>
    </div>
  );
};

const BrandLogoWidget = () => {
  return (
    <header title="Don't YOU want to pay btc for all your goods and services easily?"
      className="flex items-center"
    >
      <a href="https://fbx2h-faaaa-aaaak-ae32q-cai.icp0.io/" target="_blank" rel="noreferrer">
        <GameIconsTakeMyMoney className="stylish-menu-icon" />
      </a>
      <a target="_blank" rel="noreferrer"
        href="https://github.com/atengberg/icrc1_payment_client_demo/"
        className="m-s:ml-4 flex h-8 w-8 cursor-pointer flex-col items-center justify-center sm:ml-8">
        <GrommetIconsGithub className="themed-font-color h-8 w-8" />
      </a>
    </header>
  );
};

const CopyPaymentToSendWidget = ({ id }) => {
  const { getPaymentById } = useCanister();
  const navigate = useNavigate();
  const click = () => {
    const payment = getPaymentById(id);
    // Verify each specific detail is valid to copy, if not skip that detail:
    const { amountBaseUnits: a, description, recipientAddress: ra, status } = payment;
    let amount = a;
    let recipientAddress = ra;
    if (status.type === statusEnum.FAILED_INVALID_ADDRESS) {
      recipientAddress = "";
    } else if (status.type === statusEnum.FAILED_TRANSFER_ERR) {
      if (status.extra.toLowerCase().includes("insufficientfunds")) {
        amount = null;
      }
    };
    navigate("/payments/create", { state: { copy: { amount, description, recipientAddress }}});
  }
  return (
    <button aria-labelledby="copy-payment-to-send-label" className="z-[99]" onClick={click}>
      <RiFileCopyFill aria-hidden={true} className="stylish-menu-icon"  />
      <label className="sr-only" name="copy-payment-to-send-label" id="copy-payment-to-send-label">
        navigate to send payment form copying the details of this payment to autofill the form with
      </label>
    </button>
  );
};

const HomeWidget = () => {
  return (
    <MenuLink to="/" ariaText="navigate to user home page">
      <RiHomeFill className="stylish-menu-icon" />
    </MenuLink>
  );
};

const PaymentsListWidget = () => {
  return (
    <MenuLink to="/payments" ariaText="navigate to list of payments page">
      <IonListCircle aria-hidden={true} className="stylish-menu-icon" />
    </MenuLink>
  );
};

const SendPaymentWidget = () => {
  return (
    <MenuLink to="/payments/create" ariaText="navigate to send new payment page">
      <RiAddCircleFill aria-hidden={true} className="stylish-menu-icon" />
    </MenuLink>
  );
};

const MenuLink = ({ 
  to, 
  state = {},
  ariaText,
  children 
}) => {
  const ariaId = `${to.replace(`/`, '-')}-link-label`;
  return (
    <Link to={to} aria-labelledby={ariaId} className="z-[99]" state={state}>
      {children}
      <label className="sr-only" name={ariaId} id={ariaId}>
        {ariaText}
      </label>
    </Link>
  );
};

export default Header;
