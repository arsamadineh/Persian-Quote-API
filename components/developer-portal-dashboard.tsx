"use client"

import React, { useState, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanel, Table, TableHeader, Column, TableBody, Row, Cell } from 'react-aria-components';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Terminal, Key, Activity, Code as CodeIcon, Server, Database, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Mock Data
const errorLogs = [
  { id: 1, time: '10:45 AM', endpoint: '/api/quotes/search', status: 429, message: 'Rate limit exceeded' },
  { id: 2, time: '10:42 AM', endpoint: '/api/poets', status: 500, message: 'Internal Server Error' },
  { id: 3, time: '10:15 AM', endpoint: '/api/quotes', status: 401, message: 'Unauthorized' },
  { id: 4, time: '09:30 AM', endpoint: '/api/categories', status: 404, message: 'Not Found' },
];

export default function DeveloperPortalDashboard() {
  const [apiCalls, setApiCalls] = useState(12450);
  const [cacheHitRate, setCacheHitRate] = useState(94.2);
  const [latency, setLatency] = useState(45);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setApiCalls(prev => prev + Math.floor(Math.random() * 10));
      setCacheHitRate(prev => {
        const newValue = prev + (Math.random() * 0.2 - 0.1);
        return Math.min(Math.max(newValue, 80), 99.9);
      });
      setLatency(prev => {
        const newValue = prev + Math.floor(Math.random() * 10 - 5);
        return Math.max(newValue, 20);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification here
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 rtl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">داشبورد توسعه‌دهندگان</h1>
        <p className="text-muted-foreground">مدیریت کلیدهای API، مشاهده آمار و مستندات اتصال</p>
      </div>

      <Tabs className="w-full">
        <TabList className="flex flex-col sm:flex-row gap-2 border-b border-border pb-px mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Tab
            id="api-keys"
            className={({ isSelected }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors outline-none cursor-pointer border-b-2
              ${isSelected ? 'border-[#f28500] text-[#f28500]' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`
            }
          >
            <Key className="w-4 h-4" />
            کلیدهای API
          </Tab>
          <Tab
            id="analytics"
            className={({ isSelected }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors outline-none cursor-pointer border-b-2
              ${isSelected ? 'border-[#f28500] text-[#f28500]' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`
            }
          >
            <Activity className="w-4 h-4" />
            آمار استفاده
          </Tab>
          <Tab
            id="snippets"
            className={({ isSelected }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors outline-none cursor-pointer border-b-2
              ${isSelected ? 'border-[#f28500] text-[#f28500]' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`
            }
          >
            <CodeIcon className="w-4 h-4" />
            کدهای نمونه SDK
          </Tab>
        </TabList>

        <TabPanel id="api-keys" className="outline-none">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>کلید اصلی (Production)</span>
                  <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 mr-2">فعال</Badge>
                </CardTitle>
                <CardDescription>از این کلید در محیط عملیاتی خود استفاده کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-md" dir="ltr">
                  <code className="text-sm flex-1 font-mono text-muted-foreground truncate">pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard('pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>کلید تستی (Development)</span>
                  <Badge variant="secondary" className="mr-2">آزمایشی</Badge>
                </CardTitle>
                <CardDescription>از این کلید فقط برای توسعه و تست استفاده کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-md" dir="ltr">
                  <code className="text-sm flex-1 font-mono text-muted-foreground truncate">sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard('sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="analytics" className="outline-none">
          <div className="grid gap-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">تعداد درخواست‌ها</p>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{apiCalls.toLocaleString()}</div>
                    <span className="text-xs text-green-500 flex items-center">
                      <span className="mr-1">↑ 12%</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">نرخ موفقیت کش</p>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{cacheHitRate.toFixed(1)}%</div>
                    <span className="text-xs text-muted-foreground">در ۲۴ ساعت گذشته</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">متوسط تاخیر</p>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{latency} <span className="text-sm font-normal text-muted-foreground">ms</span></div>
                    <span className="text-xs text-muted-foreground">P95</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  لاگ خطاهای اخیر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table className="w-full text-sm text-right" aria-label="Recent error logs">
                    <TableHeader className="bg-muted/50 border-b">
                      <Column className="p-3 font-medium text-muted-foreground text-right" isRowHeader>زمان</Column>
                      <Column className="p-3 font-medium text-muted-foreground text-right">مسیر (Endpoint)</Column>
                      <Column className="p-3 font-medium text-muted-foreground text-right">وضعیت</Column>
                      <Column className="p-3 font-medium text-muted-foreground text-right">پیام</Column>
                    </TableHeader>
                    <TableBody>
                      {errorLogs.map((log, index) => (
                        <Row key={log.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/5'}`}>
                          <Cell className="p-3 font-mono text-xs" dir="ltr">{log.time}</Cell>
                          <Cell className="p-3 font-mono text-xs text-left" dir="ltr">{log.endpoint}</Cell>
                          <Cell className="p-3">
                            <Badge variant="outline" className={`font-mono text-xs
                              ${log.status === 429 ? 'border-orange-500/50 text-orange-600' :
                                log.status === 500 ? 'border-red-500/50 text-red-600' : 'border-yellow-500/50 text-yellow-600'}`}>
                              {log.status}
                            </Badge>
                          </Cell>
                          <Cell className="p-3 text-muted-foreground">{log.message}</Cell>
                        </Row>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="snippets" className="outline-none">
          <Card className="overflow-hidden border-[#f28500]/20 shadow-sm">
            <div className="bg-muted/50 p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#f28500]" />
                اتصال سریع
              </h3>
            </div>

            <Tabs className="w-full">
              <div className="bg-card px-2 pt-2 border-b" dir="ltr">
                 <TabList className="flex gap-2">
                    <Tab id="curl" className={({ isSelected }) => `px-3 py-1.5 text-xs font-mono rounded-t-md cursor-pointer outline-none transition-colors ${isSelected ? 'bg-muted border-t-2 border-[#f28500] text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>cURL</Tab>
                    <Tab id="js" className={({ isSelected }) => `px-3 py-1.5 text-xs font-mono rounded-t-md cursor-pointer outline-none transition-colors ${isSelected ? 'bg-muted border-t-2 border-[#f28500] text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>Node.js</Tab>
                    <Tab id="python" className={({ isSelected }) => `px-3 py-1.5 text-xs font-mono rounded-t-md cursor-pointer outline-none transition-colors ${isSelected ? 'bg-muted border-t-2 border-[#f28500] text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>Python</Tab>
                 </TabList>
              </div>

              <div dir="ltr" className="bg-[#0d1117] text-[#c9d1d9] p-0 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                  onClick={() => copyToClipboard('code')}
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <TabPanel id="curl" className="p-4 outline-none">
                  <pre className="text-sm font-mono overflow-x-auto leading-relaxed">
                    <code>
<span className="text-[#ff7b72]">curl</span> -X GET <span className="text-[#a5d6ff]">"https://api.persian-quotes.com/v1/quotes/random"</span> \
  -H <span className="text-[#a5d6ff]">"Authorization: Bearer YOUR_API_KEY"</span>
                    </code>
                  </pre>
                </TabPanel>

                <TabPanel id="js" className="p-4 outline-none">
                  <pre className="text-sm font-mono overflow-x-auto leading-relaxed">
                    <code className="block border-l-2 border-[#f28500] pl-3 -ml-4">
<span className="text-[#ff7b72]">const</span> fetch = <span className="text-[#d2a8ff]">require</span>(<span className="text-[#a5d6ff]">'node-fetch'</span>);

<span className="text-[#ff7b72]">async function</span> <span className="text-[#d2a8ff]">getQuote</span>() {'{'}
  <span className="text-[#ff7b72]">const</span> response = <span className="text-[#ff7b72]">await</span> <span className="text-[#d2a8ff]">fetch</span>(<span className="text-[#a5d6ff]">'https://api.persian-quotes.com/v1/quotes/random'</span>, {'{'}
    headers: {'{'}
      <span className="text-[#79c0ff]">'Authorization'</span>: <span className="text-[#a5d6ff]">'Bearer YOUR_API_KEY'</span>
    {'}'}
  {'}'});

  <span className="text-[#ff7b72]">const</span> data = <span className="text-[#ff7b72]">await</span> response.<span className="text-[#d2a8ff]">json</span>();
  <span className="text-[#79c0ff]">console</span>.<span className="text-[#d2a8ff]">log</span>(data);
{'}'}
                    </code>
                  </pre>
                </TabPanel>

                <TabPanel id="python" className="p-4 outline-none">
                  <pre className="text-sm font-mono overflow-x-auto leading-relaxed">
                    <code>
<span className="text-[#ff7b72]">import</span> requests

url = <span className="text-[#a5d6ff]">"https://api.persian-quotes.com/v1/quotes/random"</span>
headers = {'{'}
    <span className="text-[#a5d6ff]">"Authorization"</span>: <span className="text-[#a5d6ff]">"Bearer YOUR_API_KEY"</span>
{'}'}

response = requests.get(url, headers=headers)
<span className="text-[#79c0ff]">print</span>(response.json())
                    </code>
                  </pre>
                </TabPanel>
              </div>
            </Tabs>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
