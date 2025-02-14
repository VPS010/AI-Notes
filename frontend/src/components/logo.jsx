const Logo = () => {
  return (
    <>
      <div className="bg-purple-500 w-9 h-full flex flex-col justify-center rounded-3xl p-2 overflow-hidden">
        <div className="grid grid-cols-3">
          <div className="col-span-2 bg-white h-1"></div>
          <div className="col-span-1 bg-purple-500  h-1"></div>
          <div className="col-span-3 bg-purple-500  h-1"></div>
          <div className="col-span-1 bg-purple-500  h-1"></div>
          <div className="col-span-2 bg-green-400 h-1"></div>
          <div className="col-span-3 bg-purple-500  h-1"></div>
          <div className="col-span-2 bg-white h-1"></div>
          <div className="col-span-1 bg-purple-500  h-1"></div>
          <div className="col-span-3 bg-purple-500  h-1"></div>
          <div className="col-span-1 bg-purple-500  h-1"></div>
          <div className="col-span-2 bg-green-400 h-1"></div>
        </div>
      </div>
    </>
  );
};

export default Logo;
