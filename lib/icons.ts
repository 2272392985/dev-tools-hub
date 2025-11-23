import { 
  Hash, Lock, Type, MapPin, Image as ImageIcon, Binary, Pipette, Eraser, 
  Code, Stamp, FileText, Table, Bot, Flame, LayoutGrid, Network, Cpu, 
  Palette, Terminal, Paintbrush, Link, Globe, Github, Twitter, ExternalLink,
  Box, GitBranch, Smartphone, AppWindow, Monitor, Laptop, Command, Database, Server
} from "lucide-react";

export const iconMap: Record<string, any> = {
  Hash, Lock, Type, MapPin, ImageIcon, Binary, Pipette, Eraser,
  Code, Stamp, FileText, Table, Bot, Flame, LayoutGrid, Network, Cpu,
  Palette, Terminal, Paintbrush, Link, Globe, Github, Twitter, ExternalLink,
  Box, GitBranch, Smartphone, AppWindow, Monitor, Laptop, Command, Database, Server
};

export const getIcon = (name: string) => {
  return iconMap[name] || Link;
};
