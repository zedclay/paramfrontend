import { motion } from 'framer-motion';

const LoadingSkeleton = ({ className = '' }) => {
  return (
    <motion.div
      className={`bg-gray-200 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <LoadingSkeleton className="h-6 w-3/4 mb-4" />
    <LoadingSkeleton className="h-4 w-full mb-2" />
    <LoadingSkeleton className="h-4 w-5/6" />
  </div>
);

export const ImageSkeleton = () => (
  <LoadingSkeleton className="w-full h-64 rounded-lg" />
);

export default LoadingSkeleton;

