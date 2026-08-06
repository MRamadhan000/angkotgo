import Link from "next/link";
import { FiHome, FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm font-medium text-gray-500 space-x-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && <FiChevronRight className="w-4 h-4 text-gray-400" />}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              >
                {isFirst && <FiHome className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`text-gray-900 font-semibold ${isFirst ? "flex items-center gap-1.5" : ""}`}>
                {isFirst && <FiHome className="w-4 h-4 text-gray-500" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}