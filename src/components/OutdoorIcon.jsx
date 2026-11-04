import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Compass,
  ExternalLink,
  Eye,
  Info,
  MapPin,
  Package,
  Plus,
  Search,
  ShieldAlert,
  ShoppingBag,
  TriangleAlert,
  User,
  Users,
  X,
} from 'lucide-react';

const icons = {
  shield: ShieldAlert,
  check: BadgeCheck,
  'check-circle': CircleCheck,
  users: Users,
  user: User,
  bag: ShoppingBag,
  package: Package,
  search: Search,
  calendar: Calendar,
  mapPin: MapPin,
  info: Info,
  compass: Compass,
  bell: Bell,
  chevron: ChevronDown,
  chevronUp: ChevronUp,
  arrow: ArrowRight,
  eye: Eye,
  plus: Plus,
  close: X,
  'alert-triangle': TriangleAlert,
  external: ExternalLink,
};

export default function OutdoorIcon({ name, size = 24, ...props }) {
  const Icon = icons[name] || ArrowRight;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" {...props} />;
}
