import Link from 'next/link'; // Import Next.js Link for navigation

type ImageRowProps = {
  direction: 'left' | 'right';
};

const MagicImages = () => {
  return (
    <div className="w-full mx-auto p-4 font-poppins">
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-3xl font-bold font-playfair">Magic<span className="font-playfair">Images</span></h1>
        <div className="ml-auto">
        <Link href="/sign-in">
          <button className="hidden md:inline-block px-4 py-2 mr-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300 transition duration-300">
            Login
          </button>
        </Link>
        <Link href="/sign-up">
          <button className="px-4 py-2 border border-gray-600 text-black rounded hover:bg-gray-600 hover:text-white transition duration-300">
            Get Started
          </button>
        </Link>
        </div>
      </header>

      <main className="text-center mb-12 pt-10">
        <h2 className="text-5xl font-bold mb-4 font-playfair">Generate AI Images Of Yourself</h2>
        <h2 className="text-5xl font-bold mb-4 font-playfair">To Make your Imaginations</h2>
        <h2 className="text-5xl font-bold mb-4 font-playfair">A Reality</h2>

        <Link href="/dashboard/create-model">
          <button className="px-6 mt-5 py-3 border border-gray-600 text-black rounded hover:bg-gray-600 hover:text-white transition duration-300">
            Create your model now!
          </button>
        </Link>
      </main>

      <div className="space-y-12">
        <ImageRow direction="right" />
        <ImageRow direction="left" />
      </div>
    </div>
  );
};

const ImageRow = ({ direction }: ImageRowProps) => {
  const animationClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right';

  return (
    <div className="relative overflow-hidden h-40">
      <div className={`flex absolute ${animationClass}`}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-64 h-40 border border-gray-400 bg-gray-200 flex-shrink-0 mx-2"></div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
    </div>
  );
};

export default MagicImages;
