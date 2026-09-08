FROM maven:3.9.12-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S qlcstream && adduser -S qlcstream -G qlcstream
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
USER qlcstream
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
