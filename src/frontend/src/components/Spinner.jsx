import { SvgSpinnersTadpole } from "./Icons";

const Spinner = () => {
  return (
    <div className="flex h-full w-full flex-col items-center ">
      <div className="flex-[2]"></div>
      <div className="flex justify-center">
        <div className="relative h-20 w-20">
          <SvgSpinnersTadpole className="spinner-a" />
          <SvgSpinnersTadpole className="spinner-b" />
        </div>
      </div>
      <div className="flex-[5]"></div>
    </div>
  )
};

export default Spinner;