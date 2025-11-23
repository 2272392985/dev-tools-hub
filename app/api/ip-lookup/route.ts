import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ip = searchParams.get("ip");

  // 如果没有提供 IP，返回请求者的 IP
  let targetIp = ip;
  if (!targetIp) {
    // 尝试从请求头获取真实 IP
    targetIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "";
    
    if (!targetIp) {
      return NextResponse.json({ error: "无法获取 IP 地址" }, { status: 400 });
    }
  }

  // 验证 IP 格式（IPv4 或 IPv6）
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  if (!ipv4Regex.test(targetIp) && !ipv6Regex.test(targetIp)) {
    return NextResponse.json({ error: "无效的 IP 地址格式" }, { status: 400 });
  }

  try {
    // 使用免费的 IP 查询 API
    const response = await fetch(`http://ip-api.com/json/${targetIp}?lang=zh-CN`, {
      next: { revalidate: 3600 }, // 缓存 1 小时
    });

    if (!response.ok) {
      throw new Error("IP 查询服务请求失败");
    }

    const data = await response.json();

    if (data.status === "fail") {
      // 处理本地/私有 IP
      if (data.message === "reserved range" || data.message === "private range") {
        // 如果是自动查询模式（没有提供 ip 参数），尝试查询本机出口公网 IP
        if (!ip) {
          try {
            const publicIpResponse = await fetch("http://ip-api.com/json/?lang=zh-CN", {
              next: { revalidate: 3600 },
            });
            
            if (publicIpResponse.ok) {
              const publicData = await publicIpResponse.json();
              if (publicData.status === "success") {
                return NextResponse.json({
                  ip: publicData.query,
                  country: publicData.country,
                  countryCode: publicData.countryCode,
                  region: publicData.regionName,
                  regionCode: publicData.region,
                  city: publicData.city,
                  zip: publicData.zip,
                  lat: publicData.lat,
                  lon: publicData.lon,
                  timezone: publicData.timezone,
                  isp: publicData.isp,
                  org: publicData.org,
                  as: publicData.as,
                });
              }
            }
          } catch (e) {
            console.error("获取公网 IP 失败:", e);
          }
        }

        // 如果获取公网 IP 失败，或者用户手动查询私有 IP，返回本地网络信息
        return NextResponse.json({
          ip: targetIp,
          country: "本地网络",
          countryCode: "LOC",
          region: "Local Network",
          regionCode: "LOC",
          city: "Localhost",
          zip: "",
          lat: 0,
          lon: 0,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isp: "Local Network",
          org: "Local Network",
          as: "Local Network",
        });
      }

      return NextResponse.json(
        { error: data.message || "IP 查询失败" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      regionCode: data.region,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
    });
  } catch (error) {
    console.error("IP 查询错误:", error);
    return NextResponse.json(
      { error: "IP 查询服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}
